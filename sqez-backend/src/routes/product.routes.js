const router = require('express').Router()
const { Category, Product } = require('../models')

router.get('/', async (req, res) => {
  const products = await Product.findAll({ include: Category })
  res.json(products)
})

router.post('/', async (req, res) => {
  const product = await Product.create(req.body)
  res.status(201).json(product)
})

module.exports = router
