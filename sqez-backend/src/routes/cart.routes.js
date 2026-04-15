const router = require('express').Router()
const { Cart, CartItem, Order, OrderItem, Product } = require('../models')

async function getCart(cartId) {
  const [cart] = await Cart.findOrCreate({
    where: { cartId, status: 'active' },
    defaults: { cartId, status: 'active' }
  })

  return Cart.findByPk(cart.id, {
    include: [
      {
        model: CartItem,
        as: 'items',
        include: [Product]
      }
    ],
    order: [[{ model: CartItem, as: 'items' }, 'createdAt', 'ASC']]
  })
}

function serializeCart(cart) {
  const items = (cart.items || []).map((item) => ({
    id: item.id,
    quantity: item.quantity,
    productId: item.Product.id,
    title: item.Product.title,
    price: item.Product.price,
    imageUrl: item.Product.imageUrl,
    stock: item.Product.stock,
    lineTotal: item.quantity * item.Product.price
  }))

  return {
    cartId: cart.cartId,
    items,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: items.reduce((sum, item) => sum + item.lineTotal, 0)
  }
}

router.get('/:cartId', async (req, res) => {
  const cart = await getCart(req.params.cartId)
  res.json(serializeCart(cart))
})

router.post('/:cartId/items', async (req, res) => {
  const cart = await getCart(req.params.cartId)
  const product = await Product.findByPk(req.body.productId)

  if (!product) {
    return res.status(404).json({ message: 'Product not found' })
  }

  const quantity = Math.max(1, Number(req.body.quantity || 1))

  const [item] = await CartItem.findOrCreate({
    where: {
      CartId: cart.id,
      ProductId: product.id
    },
    defaults: {
      CartId: cart.id,
      ProductId: product.id,
      quantity: 0
    }
  })

  item.quantity = Math.min(item.quantity + quantity, product.stock)
  await item.save()

  const updatedCart = await getCart(req.params.cartId)
  res.status(201).json(serializeCart(updatedCart))
})

router.patch('/:cartId/items/:productId', async (req, res) => {
  const cart = await getCart(req.params.cartId)
  const item = await CartItem.findOne({
    where: {
      CartId: cart.id,
      ProductId: req.params.productId
    },
    include: [Product]
  })

  if (!item) {
    return res.status(404).json({ message: 'Cart item not found' })
  }

  const quantity = Number(req.body.quantity)

  if (!Number.isFinite(quantity) || quantity < 1) {
    await item.destroy()
  } else {
    item.quantity = Math.min(quantity, item.Product.stock)
    await item.save()
  }

  const updatedCart = await getCart(req.params.cartId)
  res.json(serializeCart(updatedCart))
})

router.delete('/:cartId/items/:productId', async (req, res) => {
  const cart = await getCart(req.params.cartId)

  await CartItem.destroy({
    where: {
      CartId: cart.id,
      ProductId: req.params.productId
    }
  })

  const updatedCart = await getCart(req.params.cartId)
  res.json(serializeCart(updatedCart))
})

router.post('/:cartId/checkout', async (req, res) => {
  const cart = await getCart(req.params.cartId)
  const serialized = serializeCart(cart)

  if (serialized.items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' })
  }

  const order = await Order.create({
    customerName: req.body.customerName || 'Guest',
    customerEmail: req.body.customerEmail || 'guest@sqez.site',
    total: serialized.totalPrice,
    status: 'new'
  })

  for (const item of serialized.items) {
    await OrderItem.create({
      OrderId: order.id,
      ProductId: item.productId,
      quantity: item.quantity,
      price: item.price
    })
  }

  await CartItem.destroy({ where: { CartId: cart.id } })

  res.status(201).json({
    message: 'Order created',
    orderId: order.id
  })
})

module.exports = router
