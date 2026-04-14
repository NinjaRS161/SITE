const { Sequelize } = require('sequelize')

const databaseUrl = process.env.DATABASE_URL

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
      dialect: 'postgres',
      logging: false
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASS,
      {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        logging: false
      }
    )

module.exports = sequelize
