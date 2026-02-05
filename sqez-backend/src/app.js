const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./config/swagger')

const app = express()

app.use(cors())
app.use(helmet())
app.use(express.json())
app.use('/uploads', express.static('src/uploads'))

app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api/products', require('./routes/product.routes'))
app.use('/api/cart', require('./routes/cart.routes'))
app.use('/api/orders', require('./routes/order.routes'))
app.use('/api/admin', require('./routes/admin.routes'))
app.use('/api/upload', require('./routes/upload.routes'))

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

module.exports = app
