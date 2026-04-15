const sequelize = require('../config/db')
const User = require('./User')
const Product = require('./Product')
const Category = require('./Category')
const Order = require('./Order')
const OrderItem = require('./OrderItem')
const Cart = require('./Cart')
const CartItem = require('./CartItem')

Category.hasMany(Product)
Product.belongsTo(Category)

User.hasMany(Order)
Order.belongsTo(User)

Order.hasMany(OrderItem)
OrderItem.belongsTo(Order)
OrderItem.belongsTo(Product)
Product.hasMany(OrderItem)

Cart.hasMany(CartItem, { as: 'items' })
CartItem.belongsTo(Cart)
Product.hasMany(CartItem)
CartItem.belongsTo(Product)

module.exports = {
  sequelize,
  User,
  Product,
  Category,
  Order,
  OrderItem,
  Cart,
  CartItem
}
