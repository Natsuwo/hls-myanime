const fs = require('fs')
const { startTool } = require('./start')

module.exports = {
    async resumeDownload() {
        try {
            var downloading = fs.readFileSync('./logs/download.json', 'utf8')
            var downloads = JSON.parse(downloading)
            if (downloads.length < 1) return;
            for (var download of downloads) {
                var drive_id = download.drive_id
                var user_id = download.user_id
                startTool(drive_id, user_id)
            }
        } catch (err) {
            fs.appendFileSync('./logs/errors.log', `${new Date} ${err.message}\n`, { encoding: 'utf8' });
        }
    }
}