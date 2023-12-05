const server = require('./server')
const { MessageReceiver } = require('ffc-messaging')
const { Client } = require('pg')
const { DefaultAzureCredential } = require('@azure/identity')
const MessageSenders = require('./messaging/create-message-sender')
const MessageReceivers = require('./messaging/create-message-receiver')
const { fileStoreQueue } = require('./config/messaging')
const { saveMetadataHandler } = require('./utils/recieveQueueHelperFunctions')
const fs = require('fs')

let fileStoreReceiver
const init = async () => {
  try {
    await executeSQLScript()
    fileStoreReceiver = new MessageReceiver(fileStoreQueue, async (msg) => {
      await saveMetadataHandler(msg.body.data)
      await fileStoreReceiver.completeMessage(msg)
    })
    await fileStoreReceiver.subscribe()
    await server.start()
    console.log('Server running on %s', server.info.uri)
  } catch (error) {
    console.error(error)
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
process.on('SIGTERM', async () => {
  await cleanup()
  process.exit(0)
})
async function executeSQLScript () {
  const DB_NAME = process.env.POSTGRES_DB
  const clientWithOutDb = new Client({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    password: process.env.POSTGRES_PASSWORD
  })
  const client = new Client({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB
  })
  try {
    if (process.env.NODE_ENV === 'production') {
      const credential = new DefaultAzureCredential()
      const accessToken = await credential.getToken(
        'https://ossrdbms-aad.database.windows.net'
      )
      client.query(
        `SET SESSION AUTHORIZATION DEFAULT, PUBLIC, ${accessToken.token}`
      )
    }
    await clientWithOutDb.connect()
    const res = await clientWithOutDb.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = '${DB_NAME}'`)
    if (res.rowCount === 0) {
      console.log(`${DB_NAME} database not found, creating it...`)
      await clientWithOutDb.query(`CREATE DATABASE "${DB_NAME}";`)
      console.log(`created database ${DB_NAME}.`)
    }
    await clientWithOutDb.end()
    const sqlScript = fs.readFileSync('./sql/tables.sql', 'utf8')
    await client.connect()
    await client.query(sqlScript)
    client.end()
    console.log('Table creation script executed successfully.')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    client.end()
  }
}
init()
async function cleanup () {
  await MessageSenders.closeAllConnections()
  await MessageReceivers.closeAllConnections()
}
