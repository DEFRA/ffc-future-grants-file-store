const { sequelize } = require('../services/db-service')

const SERVICE_UNAVAILABLE = 503
const OK = 200

module.exports = {
  method: 'GET',
  path: '/healthy',
  options: {
    handler: async (request, h) => {
      try {
        console.log('BEFORE sequelize.authenticate in HEALTHY.JS')
        const healthyTest = await sequelize.authenticate()
        console.log(' sequelize.authenticate RESULT ===>', healthyTest)
        return h.response('ok').code(OK)
      } catch (err) {
        console.error('Error running healthy check', err)
        return h.response(`Error running healthy check: ${err.message}`).code(SERVICE_UNAVAILABLE)
      }
    }
  }
}
