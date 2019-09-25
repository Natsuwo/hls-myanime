const { startTool } = require('../start')
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
    }
}