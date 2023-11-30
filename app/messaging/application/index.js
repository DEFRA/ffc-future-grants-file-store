const { sendMessage, receiveMessage } = require('../')
const { applicationRequestQueue, applicationRequestMsgType, fetchApplicationRequestMsgType, applicationResponseQueue } = require('../../config')
console.log(applicationRequestQueue, applicationRequestMsgType, fetchApplicationRequestMsgType, applicationResponseQueue)
async function getApplication (applicationReference, sessionId) {
  await sendMessage({ applicationReference }, fetchApplicationRequestMsgType, applicationRequestQueue, { sessionId })
  return receiveMessage(sessionId, applicationResponseQueue)
}

async function sendApplication (application, sessionId) {
  await sendMessage(
    application,
    applicationRequestMsgType,
    applicationRequestQueue,
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
