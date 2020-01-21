const fs = require('fs')
const md5 = require('md5')
const axios = require('axios')
const { Client, Attachment } = require('discord.js')
const tinify = require("tinify")
const { token } = require('../discord.json')
const client = new Client()
const channel = '624929128763621388'
client.login(token).catch(err => {
    console.log(err.message)
})
client.on('error', (err) => console.error(err.message))
client.on('ready', () => {
    console.log('Bot ready!')
})
axios.defaults.headers.common['Authorization'] = 'Bot ' + token

module.exports = {
    async uploadThumbnail(drive_id, user_id) {
        return new Promise(async (resolve, reject) => {
            try {
                var name = md5(drive_id)
                var path = `./files/thumbnail/${name}.jpg`
                var file = await fs.existsSync(path)
                if (!file) {
                    return resolve()
                }
                var tinykey = fs.readFileSync('./tinify.json', { encoding: "utf8" })
                tinykey = JSON.parse(tinykey)
                var rankey = tinykey[Math.floor(Math.random() * tinykey.length)]
                tinify.key = rankey
                console.log('Upload Thumbnail...')
                tinify.fromFile(path).toBuffer(async (err, resultData) => {
                    if (err) {
                        console.log("err tinify", err.message)
                        return resolve()
                    } else {
                        var attach = new Attachment(resultData, name + '.jpg')
                        var resp = await client.channels.get(channel).send(attach).catch(err => {
                            return resolve()
                        })
                        var get = await axios.get('https://discordapp.com/api/channels/' + channel + '/messages/' + resp.id).catch(err => {
                            return resolve()
                        })
                        var thumbnail = get.data.attachments[0].url
                        var myanimedomain = process.env.MYANIMEDOMAIN
                        var resp = await axios.put(myanimedomain + '/api/episode/add-thumb', { source: drive_id, thumbnail })
                        console.log(resp.data)
                    }
                })

                return resolve()
            } catch (err) {
                console.log("error catch", err.message)
                await fs.appendFileSync('./logs/errors.log', `${new Date} ${err.message}\n`, { encoding: 'utf8' });
                return resolve()
                // return reject(new Error(`${drive_id} is upload thumbnail fail. Error: ${err.message}`))
            }
        })
    }
}