const sequelize = require('../config/db')
const User = require('./User')
const Product = require('./Product')
const Category = require('./Category')
const Order = require('./Order')
const OrderItem = require('./OrderItem')

Category.hasMany(Product)
Product.belongsTo(Category)

User.hasMany(Order)
Order.belongsTo(User)

Order.hasMany(OrderItem)
OrderItem.belongsTo(Order)
OrderItem.belongsTo(Product)

module.exports = {
  sequelize,
  User,
  Product,
  Category,
  Order,
  OrderItem
}
