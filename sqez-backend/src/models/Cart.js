const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Cart = sequelize.define('Cart', {
  cartId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'active'
  }
})

module.exports = Cart
