const router = require('express').Router()
const { Order, OrderItem, Product } = require('../models')

router.get('/', async (req, res) => {
  const orders = await Order.findAll({
    include: [{ model: OrderItem, include: [Product] }]
  })
  res.json(orders)
})

router.post('/', async (req, res) => {
  const order = await Order.create({
    status: req.body.status,
    total: req.body.total
  })

  res.status(201).json(order)
})

module.exports = router
