const { MessageReceiver } = require('ffc-messaging')
const {
  fileStoreQueue,
  userDataRequestQueueAddress
} = require('../config/messaging')
const MessageSenders = require('./create-message-sender')
const MessageReceivers = require('./create-message-receiver')
const {
  saveMetadataHandler,
  deleteMetadataHandler,
  initUserDataReceiver
} = require('../utils/recieveQueueHelperFunctions')

let fileStoreReceiver
let userDataReceiver
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

async function cleanup () {
  await MessageSenders.closeAllConnections()
  await MessageReceivers.closeAllConnections()
}

process.on('SIGINT', async () => {
  await cleanup()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await cleanup()
  process.exit(0)
})

module.exports = {
  cleanup,
  initializeMessageReceivers
}
