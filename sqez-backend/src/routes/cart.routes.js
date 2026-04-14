const router = require('express').Router()

router.get('/', (req, res) => {
  res.json({
    items: [],
    message: 'Cart persistence is not implemented yet.'
  })
})

module.exports = router
