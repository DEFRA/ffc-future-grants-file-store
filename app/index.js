const server = require('./server')
const { MessageReceiver } = require('ffc-messaging')
const { Client } = require('pg')
const {
  fileStoreQueue,
  userDataRequestQueueAddress
} = require('./config/messaging')
const {
  saveMetadataHandler,
  deleteMetadataHandler,
  initUserDataReceiver
} = require('./utils/recieveQueueHelperFunctions')
const fs = require('fs')
const MessageSenders = require('./messaging/create-message-sender')
const MessageReceivers = require('./messaging/create-message-receiver')

let fileStoreReceiver
let userDataReceiver

async function init () {
  try {
    await initializeMessageReceivers()
    await server.start()
    console.log('Server running on %s', server.info.uri)
    await runSqlScript()
  } catch (error) {
    console.error('Error during initialization:', error)
    await cleanup()
    process.exit(1)
  }
}
process.on('unhandledRejection', async (err) => {
  console.log('[ERROR HERE]')
  console.log(err)
  await cleanup()
  process.exit(1)
})

async function initializeMessageReceivers () {
  userDataReceiver = new MessageReceiver(
    userDataRequestQueueAddress,
    async (msg) => {
      console.log('User data message received')
      await initUserDataReceiver(msg.body.sessionId, msg.body.userId)
      await userDataReceiver.completeMessage(msg)
    }
  )
  await userDataReceiver.subscribe()

  fileStoreReceiver = new MessageReceiver(fileStoreQueue, async (msg) => {
    if (msg.body.method === 'add') {
      await saveMetadataHandler(msg.body.data)
    } else {
      await deleteMetadataHandler(msg.body.fileId)
    }
    await fileStoreReceiver.completeMessage(msg)
  })
  await fileStoreReceiver.subscribe()
}

async function runSqlScript () {
  const DB_NAME = process.env.POSTGRES_DB
  const clientWithOutDb = new Client({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    password: process.env.POSTGRES_PASSWORD,
    ssl: process.env.NODE_ENV === environments.production
  })
  const client = new Client({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    ssl: process.env.NODE_ENV === environments.production
  })
  try {
    console.log('[CHECKING IF DB EXIST]')
    await clientWithOutDb.connect()
    const res = await clientWithOutDb.query(
      `SELECT datname FROM pg_catalog.pg_database WHERE datname = '${DB_NAME}'`
    )
    if (res.rowCount === 0) {
      console.log(`${DB_NAME} DATABASE NOT FOUND CREATING IT...`)
      await clientWithOutDb.query(`CREATE DATABASE ${DB_NAME}`)
      console.log(`YAHOO DB SUCCESSFULLY CREATED ${DB_NAME}.`)
    }
    await clientWithOutDb.end()
    console.log('[TRYING TO READ SCRIPT FILE]')
    const sqlScript = fs.readFileSync('./sql/tables.sql', 'utf8')
    await client.connect()
    await client.query(sqlScript)
    console.log('Table creation script executed successfully.')
  } catch (error) {
    console.error('Error executing SQL script:', error)
  } finally {
    await client.end()
  }
}

async function cleanup () {
  await MessageSenders.closeAllConnections()
  await MessageReceivers.closeAllConnections()
}

init()
  .then(() => {
    console.log('Initialization complete.')
    // Other synchronous code here
  })
  .catch((error) => {
    console.error('Error during initialization:', error)
    cleanup().then(() => process.exit(1))
  })

process.on('unhandledRejection', async (err) => {
  console.error('Unhandled Rejection error:', err)
  await cleanup()
  process.exit(1)
})

process.on('SIGINT', async () => {
  try {
    await server.stop()
    console.log('Server stopped successfully.')
  } catch (error) {
    console.error('Error stopping server:', error)
  } finally {
    await cleanup()
    process.exit(0)
  }
})

process.on('SIGTERM', async () => {
  await cleanup()
  process.exit(0)
})
