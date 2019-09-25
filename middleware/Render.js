
const fs = require('fs')
const md5 = require('md5')
const axios = require('axios')
const SERVER_IP = process.env.SERVER_IP
const ffmpeg = require('fluent-ffmpeg')

module.exports = {
    async renderVideo(drive_id, user_id) {
        const Api = axios.create({
            baseURL: SERVER_IP,
            headers: { user_id, drive_id, access_key: process.env.ACCESS_KEY }
        })
        return new Promise(async (resolve, reject) => {
            try {
                var fileName = md5(drive_id)
                var dir = `./files`
                var path = `${dir}/${fileName}.mp4`
                var file = await fs.existsSync(path)
                if (!file) {
                    return reject()
                }

                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }
                console.log('Render Video...')
                var count = 0
                var cou = setInterval(() => {
                    count++
                    console.log(count)
                }, 1000)
               
                ffmpeg(path, { timeout: 432000 }).addOptions([
                    '-codec copy',
                    '-start_number 0',     // start the first .ts segment at index 0
                    '-hls_time 60',        // 10 second segment duration
                    '-f hls',               // HLS format
                    '-sn',
                    `-hls_segment_filename files/chunk/${fileName}_%03d.jpg`,
                    '-hls_playlist_type vod'
                ]).output(`./files/m3u8/${fileName}.m3u8`).on('end', async () => {
                    clearInterval(cou)
                    await Api.post('/v2/hls/update-drive', { downloaded: true, rendered: true })
                    return resolve()
                }).on('error', function(err) {
                    return reject(new Error(err.message))
                  }).run()

            } catch (err) {
                fs.appendFileSync('./logs/errors.log', `${new Date} ${err.message} at Render video\n`, { encoding: 'utf8' });
                return reject(new Error(`${drive_id} is render video fail. Error: ${err.message}`))
            }
        })
    },

    async renderThumb(drive_id, user_id) {
        return new Promise(async (resolve, reject) => {
            try {
                var fileName = md5(drive_id)
                var dir = `./files`
                var path = `${dir}/${fileName}.mp4`
                var file = await fs.existsSync(path)
                if (!file) {
                    return reject()
                }
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }
                console.log('Render Thumbnail...')
                ffmpeg(path).addOptions([
                    '-ss 00:01:00',
                    '-vframes 1',
                ]).output(`./files/thumbnail/${fileName}.jpg`).on('end', () => {
                    return resolve()
                }).run()

            } catch (err) {
                fs.appendFileSync('./logs/errors.log', `${new Date} ${err.message} at Render thumbnail\n`, { encoding: 'utf8' });
                return reject(new Error(`${drive_id} is render thumbnail fail. Error: ${err.message}`))
            }
        })
    }
}