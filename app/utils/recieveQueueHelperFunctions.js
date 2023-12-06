const { Client } = require('pg')

const saveMetadataHandler = async (data) => {
  const query = `
      INSERT INTO ffc_future_grants_file_store (
        file_id, file_name, file_size, file_type, category,
        user_ID, business_ID, case_ID, grant_scheme,
        grant_sub_scheme, grant_theme, date_time, storage_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
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
    return true
  } catch (error) {
    console.error('Error saving data to the database:\n', error)
  } finally {
    await client.end()
  }
}
const deleteMetedataHandler = async (fileId) => {
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

module.exports = { saveMetadataHandler, deleteMetedataHandler }
