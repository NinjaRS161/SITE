const router = require('express').Router()
const { Product, Order } = require('../models')

router.get('/dashboard', async (req, res) => {
  const orders = await Order.count()
  const products = await Product.count()
  res.render('dashboard', { orders, products })
})

module.exports = router
