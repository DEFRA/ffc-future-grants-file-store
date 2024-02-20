const { Client } = require('pg')
const {
  applicationRequestMsgType,
  userDataResponseQueueAddress,
  filesStoredTopicAddress
} = require('../config/messaging')
const { sendMessage } = require('../messaging')

const initUserDataReceiver = async (sessionId, userId) => {
  console.log('IN INIT USER DATA HANDLER')
  try {
    const userData = await getMetadataHandler(userId)
    await sendMessage(
      { data: userData, sessionId },
      applicationRequestMsgType,
      userDataResponseQueueAddress,
      { sessionId }
    )
    console.log('Response successfull sent back')
  } catch (error) {
    console.log('Error in setting up user data message receiver:/\n ', error)
  }
}

const saveMetadataHandler = async (data) => {
  console.log('IN SAVE META DATA HANDLER')

  const query = `
      INSERT INTO ffc_future_grants_file_store (
        file_id, file_name, file_size, file_type, file_extension, category,
        user_ID, business_ID, case_ID, grant_scheme,
        grant_sub_scheme, grant_theme, date_time, storage_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `
  const client = new Client({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    port: process.env.POSTGRES_PORT,
    password: process.env.POSTGRES_PASSWORD
  })
  try {
    await client.connect()
    for (const file of data) {
      const values = [
        file.fileId,
        file.fileName,
        file.fileSize,
        file.fileType,
        file.fileExtension,
        file.category,
        file.userId,
        file.bussinessId,
        file.caseId,
        file.grantScheme,
        file.grantSubScheme,
        file.grantTheme,
        file.dateAndTime,
        file.storageUrl
      ]
      await client.query(query, values)
    }
    await client.end()
    console.log('Data saved successfully.')
    await sendMessage({ data, message: 'New file(s) added to Database.' }, applicationRequestMsgType, filesStoredTopicAddress)
    console.log('<<<Topic message successfully sent!>>>')
    return true
  } catch (error) {
    console.error('Error saving data to the database:\n', error)
  } finally {
    await client.end()
  }
}
const deleteMetadataHandler = async (fileId) => {
  console.log('IN DELETE META DATA HANDLER')

  const query = 'DELETE FROM ffc_future_grants_file_store WHERE file_id = $1'
  const client = new Client({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    port: process.env.POSTGRES_PORT,
    password: process.env.POSTGRES_PASSWORD
  })
  try {
    await client.connect()
    await client.query(query, [fileId])
    console.log(`File with ID: ${fileId} deleted.`)
  } catch (err) {
    console.log(err)
  }
}
const getMetadataHandler = async (userId) => {
  console.log('IN GET META DATA HANDLER')
  const query = 'SELECT * FROM ffc_future_grants_file_store WHERE user_id = $1'
  const client = new Client({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    port: process.env.POSTGRES_PORT,
    password: process.env.POSTGRES_PASSWORD
  })
  try {
    await client.connect()
    const fetchedData = await client.query(query, [userId])
    const rows = fetchedData.rows
    console.log('Fetched Data:====>>>> \n', userId)
    await client.end()

    const data = {
      claim: null,
      multiForms: {
        purchased: [],
        paid: [],
        inPlace: [],
        conditions: []
      }
    }
    if (rows.length) {
      for (const file of rows) {
        if (file.file_type === 'claim') {
          data.claim = file
        } else if (file.file_type === 'purchased') {
          data.multiForms.purchased = [...data.multiForms.purchased, file]
        } else if (file.file_type === 'paid') {
          data.multiForms.paid = [...data.multiForms.paid, file]
        } else if (file.file_type === 'inPlace') {
          data.multiForms.inPlace = [...data.multiForms.inPlace, file]
        } else if (file.file_type === 'conditions') {
          data.multiForms.conditions = [...data.multiForms.conditions, file]
        }
      }
    }
    return data
  } catch (error) {
    await client.end()
    console.log('Error in get user data handler: \n', error)
  }
}

module.exports = {
  saveMetadataHandler,
  deleteMetadataHandler,
  initUserDataReceiver
}
