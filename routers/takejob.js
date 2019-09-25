const { Router } = require('express')
const route = Router()
const { takeJob } = require('../controllers/takejob')

route.post('/v1/add-job', takeJob)

module.exports = route