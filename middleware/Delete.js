const fs = require('fs')
const md5 = require('md5')
const axios = require('axios')
const SERVER_IP = process.env.SERVER_IP

module.exports = {
    // Delete File
    async deleteFile(drive_id, user_id) {
        const Api = axios.create({
            headers: { user_id, drive_id, access_key: process.env.ACCESS_KEY },
            baseURL: SERVER_IP
        })

        return new Promise(async (resolve, reject) => {
            try {
                var type = process.env.TYPE
                var ip = process.env.API
                var fileName = md5(drive_id)
                var dir = `./files`
                var path = `${dir}/${fileName}.mp4`

                var file = await fs.existsSync(path)
                if (file) {
                    await fs.unlinkSync(path)
                }
                var thumbnail = await fs.readdirSync(`${dir}/thumbnail`)
                if (thumbnail.length > 0) {
                    await fs.unlinkSync(`${dir}/thumbnail/${fileName}.jpg`)
                }
                var m3u8 = await fs.readdirSync(`${dir}/m3u8`)
                if (m3u8.length > 0) {
                    await fs.unlinkSync(`${dir}/m3u8/${fileName}.m3u8`)
                }
                var chunk = await fs.readdirSync(`${dir}/chunk`)
                for (var file of chunk) {
                    await fs.unlinkSync(`${dir}/chunk/${file}`)
                }

                await Api.post('/v2/hls/update-drive', { downloaded: true, rendered: true, deleted: true })
                var resp = await Api.put('/v2/job/on-task-complated', { type, ip })
                console.log(resp.data)
                // Check cookie and delete
                var currDownload = fs.readFileSync('./logs/download.json', 'utf8')
                var json = JSON.parse(currDownload)
                var isHas = json.filter(x => x.drive_id === drive_id)[0]
                if (isHas) {
                    var index = json.findIndex(x => x.drive_id === drive_id)
                    json.splice(index, 1)
                    fs.writeFileSync('./logs/download.json', JSON.stringify(json), 'utf8')
                }
                await Api.post('/v2/job/add-message', { message: `File: <strong>${drive_id}</strong> upload completed.` })
                console.log('a file has deleted by system because upload completed.')
                return process.exit(0);

            } catch (err) {
                fs.appendFileSync('./logs/errors.log', `${new Date} ${err.message}\n`, { encoding: 'utf8' });
            }
        })
    },
    async deleteFileError(drive_id, user_id) {
        const Api = axios.create({
            headers: { user_id, drive_id, access_key: process.env.ACCESS_KEY },
            baseURL: SERVER_IP
        })

        return new Promise(async (resolve, reject) => {
            try {
                var type = process.env.TYPE
                var ip = process.env.API
                var fileName = md5(drive_id)
                var dir = `./files`
                var path = `${dir}/${fileName}.mp4`

                var file = await fs.existsSync(path)
                if (file) {
                    await fs.unlinkSync(path)
                }
                var thumbnail = await fs.readdirSync(`${dir}/thumbnail`)
                if (thumbnail.length > 0) {
                    await fs.unlinkSync(`${dir}/thumbnail/${fileName}.jpg`)
                }
                var m3u8 = await fs.readdirSync(`${dir}/m3u8`)
                if (m3u8.length > 0) {
                    await fs.unlinkSync(`${dir}/m3u8/${fileName}.m3u8`)
                }
                var chunk = await fs.readdirSync(`${dir}/chunk`)
                for (var file of chunk) {
                    await fs.unlinkSync(`${dir}/chunk/${file}`)
                }

                var resp = await Api.put('/v2/job/on-task-complated', { type, ip })
                console.log(resp.data)
                // Check cookie and delete
                var currDownload = fs.readFileSync('./logs/download.json', 'utf8')
                var json = JSON.parse(currDownload)
                var isHas = json.filter(x => x.drive_id === drive_id)[0]
                if (isHas) {
                    var index = json.findIndex(x => x.drive_id === drive_id)
                    json.splice(index, 1)
                    fs.writeFileSync('./logs/download.json', JSON.stringify(json), 'utf8')
                }
                await Api.post('/v2/job/add-message', { message: `File: <strong>${drive_id}</strong> upload error.` })
                return console.log('a file has deleted by system because upload error.')

            } catch (err) {
                fs.appendFileSync('./logs/errors.log', `${new Date} ${err.message}\n`, { encoding: 'utf8' });
            }
        })
    }
}