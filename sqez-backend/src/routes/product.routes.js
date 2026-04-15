const router = require('express').Router()
const { Category, Product } = require('../models')

router.get('/', async (req, res) => {
  const where = {}

  if (req.query.category) {
    const category = await Category.findOne({
      where: { name: req.query.category }
    })

    if (!category) {
      return res.json([])
    }

    where.CategoryId = category.id
  }

  const products = await Product.findAll({
    where,
    include: Category,
    order: [['createdAt', 'ASC']]
  })

  res.json(
    products.map((product) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      stock: product.stock,
      sizes: product.sizes,
      colors: product.colors,
      imageUrl: product.imageUrl,
      category: product.Category?.name || null
    }))
  )
})

router.post('/', async (req, res) => {
  const product = await Product.create(req.body)
  res.status(201).json(product)
})

router.get('/categories/list', async (req, res) => {
  const categories = await Category.findAll({
    order: [['name', 'ASC']]
  })

  res.json(categories.map((category) => category.name))
})

module.exports = router
