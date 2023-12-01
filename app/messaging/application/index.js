const { sendMessage, receiveMessage } = require('../')
const { fileStoreQueue, applicationRequestMsgType, fetchApplicationRequestMsgType, applicationResponseQueue } = require('../../config')
console.log(fileStoreQueue, applicationRequestMsgType, fetchApplicationRequestMsgType, applicationResponseQueue)
async function getApplication (applicationReference, sessionId) {
  await sendMessage({ applicationReference }, fetchApplicationRequestMsgType, fileStoreQueue, { sessionId })
  return receiveMessage(sessionId, applicationResponseQueue)
}

async function sendApplication (application, sessionId) {
  await sendMessage(
    application,
    applicationRequestMsgType,
    fileStoreQueue,
    { sessionId }
  )
  const response = await receiveMessage(
    sessionId,
    applicationResponseQueue
  )
  console.log(`Received response ${JSON.stringify(response)} from queue ${applicationResponseQueue.address} for sessionID ${sessionId}.`)
  return response?.applicationReference
}
module.exports = {
  getApplication,
  sendApplication
}
