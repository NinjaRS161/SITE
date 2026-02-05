const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Product = sequelize.define('Product', {
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  price: DataTypes.INTEGER,
  sizes: DataTypes.ARRAY(DataTypes.STRING),
  colors: DataTypes.ARRAY(DataTypes.STRING),
  stock: DataTypes.INTEGER
})

module.exports = Product
