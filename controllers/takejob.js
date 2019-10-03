const { startTool } = require('../start')
const auth = require('../middleware/auth.json')
const axios = require('axios')
// Export Module
module.exports = {
    async takeJob(req, res) {
        try {
            var { drive_id, user_id } = req.body
            var { access_key } = req.headers
            if (!access_key || access_key !== process.env.ACCESS_KEY) throw Error('Access denied.')
            if (!drive_id || !user_id) throw Error('missing driveid or userid.')
            startTool(drive_id, user_id)
            return res.send({ success: true })
        } catch (err) {
            res.send({ success: false, error: err.message })
        }
    },
    async getAuth(req, res) {
        try {
            var rand = auth[Math.floor(Math.random() * auth.length)]
            var client_id = rand.client_id
            var client_secret = rand.client_secret
            var refresh_token = rand.refresh_token
            var grant_type = 'refresh_token'
            var form = { client_id, client_secret, refresh_token, grant_type }
            var response = await axios.post('https://accounts.google.com/o/oauth2/token', form)
            var token = response.data.access_token
            var folder_id = "14HrxkNSB2hlkzMYKyFB3CKxjF-MZGRx3"
            res.send({ success: true, results: { token, folder_id } })
        } catch (err) {
            res.send({ success: false, error: err.message })
        }
    }
}