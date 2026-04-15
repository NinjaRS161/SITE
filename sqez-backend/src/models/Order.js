const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Order = sequelize.define('Order', {
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Guest'
  },
  customerEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'guest@sqez.site'
  },
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
