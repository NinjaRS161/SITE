const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { User } = require('../models')

exports.register = async (req, res) => {
  const hash = await bcrypt.hash(req.body.password, 10)
  const user = await User.create({ ...req.body, password: hash })
  res.json(user)
}

exports.login = async (req, res) => {
  const user = await User.findOne({ where: { email: req.body.email } })
  if (!user) return res.sendStatus(401)

  const valid = await bcrypt.compare(req.body.password, user.password)
  if (!valid) return res.sendStatus(401)

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET)
  res.json({ token })
}
