require('dotenv').config()
const app = require('./app')
const { sequelize } = require('./models')
const { seedCatalog } = require('./config/seed')

const PORT = process.env.PORT || 5000

async function start() {
  try {
    await sequelize.authenticate()
    await sequelize.sync({ alter: true })
    await seedCatalog()
    app.listen(PORT, () =>
      console.log(`🚀 SQez API running on port ${PORT}`)
    )
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

start()
