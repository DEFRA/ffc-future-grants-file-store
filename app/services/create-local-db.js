const { Client } = require('pg')
const fs = require('fs')
const { environments } = require('../config/constants')

async function runSqlScript () {
  console.log('IN RUN SCRIPT FUNCTION \n \n')
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

module.exports = runSqlScript
