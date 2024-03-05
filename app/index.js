const {
  initializeMessageReceivers,
  cleanup
} = require('./messaging/receivers')
const server = require('./server')

async function init () {
  // const runSqlScript = require('./services/create-local-db')
  await initializeMessageReceivers()
  await server.start()
  console.log('Server running on %s', server.info.uri)
  // await runSqlScript()
}

process.on('unhandledRejection', async (err) => {
  console.log('ERROR: ', err)
  await cleanup()
  process.exit(1)
})

init()
