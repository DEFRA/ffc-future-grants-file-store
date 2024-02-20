const fs = require('fs')
const path = require('path')
const { Sequelize, DataTypes } = require('sequelize')
const config = require('../config/db-config')
const dbConfig = config[process.env.NODE_ENV]
const modelPath = path.join(__dirname, '..', 'models')

module.exports = (() => {
  const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    dbConfig
  )
  console.log('SEQUELIZE VALUE IN {db-service.js}', sequelize)

  fs.readdirSync(modelPath)
    .filter((file) => {
      return (
        file.indexOf('.') !== 0 &&
        file !== 'index.js' &&
        file.slice(-3) === '.js'
      )
    })
    .forEach((file) =>
      require(path.join(modelPath, file))(sequelize, DataTypes)
    )
  console.log('SEQUELIZE MODEL PATH==> ', modelPath)
  console.log('SEQUELIZE MODELS ARRAY==> ', sequelize.models)
  for (const model of Object.values(sequelize.models)) {
    console.log('MODEL in db-service.js', model)
    console.log('model.associate result ===> ', model.associate)
    if (model.associate) {
      console.log('model.associate was true and passed')
      model.associate(sequelize.models)
    }
  }

  return {
    models: sequelize.models,
    sequelize
  }
})()
