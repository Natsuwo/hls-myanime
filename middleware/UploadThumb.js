const fs = require('fs')
const md5 = require('md5')
const axios = require('axios')
const { Client, Attachment } = require('discord.js')
const token = process.env.TOKEN_DISCORD
const client = new Client()
const channel = '624929128763621388'
client.login(token).catch(err => {
    console.log(err.message)
})
client.on('error', (err) => console.error(err.message))
client.on('ready', () => {
    console.log('Bot ready!')
})
axios.defaults.headers.common['Authorization'] = 'Bot ' + process.env.TOKEN_DISCORD

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
                console.log('Upload Thumbnail...')
                var attach = new Attachment(path, name + '.jpg')
                var resp = await client.channels.get(channel).send(attach).catch(err => {
                    return resolve()
                })
                var get = await axios.get('https://discordapp.com/api/channels/' + channel + '/messages/' + resp.id).catch(err => {
                    return resolve()
                })
                var thumbnail = get.data.attachments[0].url
                var myanimedomain = process.env.MYANIMEDOMAIN
                await axios.put(myanimedomain + '/api/episode/add-thumb', { source: drive_id, thumbnail })

                return resolve()
            } catch (err) {
                return reject(new Error(`${drive_id} is upload thumbnail fail. Error: ${err.message}`))
            }
        })
    }
}