const server = require('./server')
const { Client } = require('pg');
const { DefaultAzureCredential } = require('@azure/identity');

const init = async () => {
  await executeSQLScript();
  await server.start()
  console.log('Server running on %s', server.info.uri)
}

process.on('unhandledRejection', (err) => {
  console.log(err)
  process.exit(1)
})

async function executeSQLScript() {
  const client = new Client({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    port: process.env.POSTGRES_PORT,
    password: process.env.POSTGRES_PASSWORD,
  });

  try {
    await client.connect();

    if (process.env.NODE_ENV === 'production') {
      const credential = new DefaultAzureCredential();
      const accessToken = await credential.getToken('https://ossrdbms-aad.database.windows.net');
      client.query(`SET SESSION AUTHORIZATION DEFAULT, PUBLIC, ${accessToken.token};`);
    }

    const fs = require('fs');
    const sqlScript = fs.readFileSync('./sql/tables.sql', 'utf8');
    await client.query(sqlScript);

    console.log('Table creation script executed successfully.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.end();
  }
}


init()
