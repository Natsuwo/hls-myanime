const { Router } = require('express')
const router = Router()
// Hosts
const takejob = require('./routers/takejob')
router.use(takejob)

module.exports = router