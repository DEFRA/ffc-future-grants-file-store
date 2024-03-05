const { Client } = require('pg')
const fs = require('fs')
const { environments } = require('../config/constants')

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
    await clientWithOutDb.connect()
    const res = await clientWithOutDb.query(
      `SELECT datname FROM pg_catalog.pg_database WHERE datname = '${DB_NAME}'`
    )
    if (res.rowCount === 0) {
      await clientWithOutDb.query(`CREATE DATABASE ${DB_NAME}`)
    }
    await clientWithOutDb.end()
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
