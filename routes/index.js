const express = require('express')
const router = express.Router()
const admin = require('./modules/admin')

router.use('/admin', admin)

router.use('/', (req, res) => res.send('404 not found'))

module.exports = router
