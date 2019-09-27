const { Router } = require('express')
const route = Router()
const { takeJob, getAuth } = require('../controllers/takejob')
const apicache = require('apicache')
let cache = apicache.middleware

route.post('/v1/add-job', takeJob)
route.get('/v2/get-auth', getAuth)
module.exports = route