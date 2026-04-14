const router = require('express').Router()

router.post('/', (req, res) => {
  res.status(501).json({
    message: 'File uploads are not configured for the Render free tier yet.'
  })
})

module.exports = router
