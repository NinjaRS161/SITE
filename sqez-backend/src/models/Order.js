const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Order = sequelize.define('Order', {
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'new'
  },
  total: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
})

module.exports = Order
