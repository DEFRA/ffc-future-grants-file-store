const Joi = require('joi')

const msgTypePrefix = 'uk.gov.ffc.grants'

const mqSchema = Joi.object({
  messageQueue: {
    host: Joi.string().required(),
    username: Joi.string(),
    password: Joi.string(),
    useCredentialChain: Joi.bool().default(false),
    appInsights: Joi.object()
  },
  fileStoreQueue: {
    address: process.env.FILE_STORE_QUEUE_ADDRESS,
    type: 'queue'
  },
  userDataRequestQueueAddress: {
    address: process.env.USER_DATA_REQ_QUEUE_ADDRESS,
    type: 'queue'
  },
  userDataResponseQueueAddress: {
    address: process.env.USER_DATA_RES_QUEUE_ADDRESS,
    type: 'sessionQueue'
  },
  filesStoredTopicAddress: {
    address: process.env.FILES_STORED_TOPIC_ADDRESS,
    type: 'topic'
  },
  applicationRequestMsgType: `${msgTypePrefix}.app.request`,
  fetchApplicationRequestMsgType: `${msgTypePrefix}.fetch.app.request`
})
const mqConfig = {
  messageQueue: {
    host: process.env.SERVICE_BUS_HOST,
    password: process.env.SERVICE_BUS_PASSWORD,
    username: process.env.SERVICE_BUS_USER,
    useCredentialChain: process.env.NODE_ENV === 'production',
    appInsights:
      process.env.NODE_ENV === 'production'
        ? require('applicationinsights')
        : undefined
  },
  fileStoreQueue: {
    address: process.env.FILE_STORE_QUEUE_ADDRESS,
    type: 'queue'
  },
  userDataRequestQueueAddress: {
    address: process.env.USER_DATA_REQ_QUEUE_ADDRESS,
    type: 'queue'
  },
  userDataResponseQueueAddress: {
    address: process.env.USER_DATA_RES_QUEUE_ADDRESS,
    type: 'sessionQueue'
  },
  filesStoredTopicAddress: {
    address: process.env.FILES_STORED_TOPIC_ADDRESS,
    type: 'topic'
  },
  applicationRequestMsgType: `${msgTypePrefix}.app.request`,
  fetchApplicationRequestMsgType: `${msgTypePrefix}.fetch.app.request`
}
const mqResult = mqSchema.validate(mqConfig, {
  abortEarly: false
})
if (mqResult.error) {
  throw new Error(
    `The message queue config is invalid. ${mqResult.error.message}`
  )
}
const fileStoreQueue = {
  ...mqResult.value.messageQueue,
  ...mqResult.value.fileStoreQueue,
  address: process.env.FILE_STORE_QUEUE_ADDRESS
}
const applicationRequestMsgType = mqResult.value.applicationRequestMsgType
const userDataRequestQueueAddress = {
  ...mqResult.value.messageQueue,
  ...mqResult.value.userDataRequestQueueAddress
}
const userDataResponseQueueAddress = {
  ...mqResult.value.messageQueue,
  ...mqResult.value.userDataResponseQueueAddress
}
const filesStoredTopicAddress = {
  ...mqResult.value.messageQueue,
  ...mqResult.value.filesStoredTopicAddress
}

module.exports = {
  fileStoreQueue,
  applicationRequestMsgType,
  userDataRequestQueueAddress,
  userDataResponseQueueAddress,
  filesStoredTopicAddress
}
