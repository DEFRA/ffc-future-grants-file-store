const server = require('./server')
const { MessageReceiver } = require('ffc-messaging')
const { Client } = require('pg')
const { DefaultAzureCredential } = require('@azure/identity')
const MessageSenders = require('./messaging/create-message-sender')
const MessageReceivers = require('./messaging/create-message-receiver')
const { applicationRequestQueue } = require('./config/messaging')
let fileStoreReceiver
const init = async () => {
  try {
    await executeSQLScript()
    fileStoreReceiver = new MessageReceiver(applicationRequestQueue, (msg) =>
      console.log(msg.body)
    )
    await fileStoreReceiver.subscribe()
    await server.start()
    console.log('Server running on %s', server.info.uri)
  } catch (error) {
    console.error(error)
    await fileStoreReceiver.closeConnection()
    cleanup()
    process.exit(1)
  }
}
process.on('unhandledRejection', async (err) => {
  console.log('unhandled Rejection error: \n', err)
  await fileStoreReceiver.closeConnection()
  process.exit(1)
})

process.on('SIGINT', () => {
  server
    .stop()
    .then(() => {
      cleanup()
      process.exit(0)
    })
    .catch((err) => {
      console.error(err)
      cleanup()
      process.exit(1)
    })
})

async function executeSQLScript () {
  const client = new Client({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    port: process.env.POSTGRES_PORT,
    password: process.env.POSTGRES_PASSWORD
  })

  try {
    await client.connect()

    if (process.env.NODE_ENV === 'production') {
      const credential = new DefaultAzureCredential()
      const accessToken = await credential.getToken(
        'https://ossrdbms-aad.database.windows.net'
      )
      client.query(
        `SET SESSION AUTHORIZATION DEFAULT, PUBLIC, ${accessToken.token}`
      )
    }

    const fs = require('fs')
    const sqlScript = fs.readFileSync('./sql/tables.sql', 'utf8')
    await client.query(sqlScript)

    console.log('Table creation script executed successfully.')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    client.end()
  }
}
init()
function cleanup () {
  MessageSenders.closeAllConnections()
  MessageReceivers.closeAllConnections()
}
