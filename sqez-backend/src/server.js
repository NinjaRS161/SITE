require('dotenv').config()
const app = require('./server')
const { sequelize } = require('./models')

const PORT = process.env.PORT || 5000

async function start() {
  try {
    await sequelize.authenticate()
    await sequelize.sync()
    app.listen(PORT, () =>
      console.log(`🚀 SQez API running on port ${PORT}`)
    )
  } catch (e) {
    console.error(e)
  }
}

start()
