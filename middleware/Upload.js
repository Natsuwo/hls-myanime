var path = require('path')
const fs = require('fs')
const md5 = require('md5')
const axios = require('axios')
const SERVER_IP = process.env.SERVER_IP
const BASEURL = process.env.BASEURL
const { google } = require('googleapis')
const { createNewTeamDrive, changeFolder } = require('./helpers')

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    async uploadToDrive(drive_id, user_id) {
        return new Promise(async (resolve, reject) => {
            const Api = axios.create({
                baseURL: SERVER_IP,
                headers: { user_id, drive_id, access_key: process.env.ACCESS_KEY }
            })
            // var auth = await Api.get('/v2/hls/get-auth')
            // var results = auth.data.results
            var auth = await axios.get(process.env.API + '/v2/get-auth')
            var results = auth.data.results
            try {
                const oauth2Client = new google.auth.OAuth2()
                oauth2Client.setCredentials({
                    'access_token': results.token
                });
                const drive = google.drive({
                    version: 'v3',
                    auth: oauth2Client
                });

                var fileName = md5(drive_id)
                var dir = `./files/m3u8`
                var fPath = './files/chunk'

                var fileMetadata = {
                    'name': fileName,
                    'parents': [results.folder_id],
                    'mimeType': 'application/vnd.google-apps.folder'
                };
                var newFolder = await drive.files.create({
                    resource: fileMetadata,
                    fields: 'id',
                    supportsTeamDrives: true
                });

                var folder = fs.readdirSync(fPath)
                var ext = '.jpg';
                var files = folder.filter(f => path.extname(f).toLowerCase() === ext);
                console.log('Upload Video...')
                for (var item of files) {
                    var driveResponse = await drive.files.create({
                        requestBody: {
                            name: item,
                            parents: [newFolder.data.id],
                        },
                        media: {
                            body: fs.createReadStream(`${fPath}/${item}`)
                        },
                        supportsAllDrives: true
                    });
                    var file = fs.readFileSync(`${dir}/${fileName}.m3u8`, 'utf8');
                    var driveId = driveResponse.data.id
                    await drive.permissions.create({
                        fileId: driveResponse.data.id,
                        resource: {
                            role: "reader",
                            type: "anyone",
                            allowFileDiscovery: true
                        },
                        supportsTeamDrives: true
                    });
                    // var result = file.replace(item, `/get-chunk/${fileName}/${item}`);
                    var result = file.replace(new RegExp(item, 'g'), `/get-hls/${driveId}`)
                    await fs.writeFileSync(`${dir}/${fileName}.m3u8`, result, 'utf8')
                    console.log('Upload completed ' + item)
                }
                await Api.post('/v2/hls/upload-hls', { file: `${BASEURL}/m3u8/${fileName}.m3u8`, file_name: `${fileName}.m3u8` })
                setTimeout(() => {
                    return resolve()
                }, 5000)

            } catch (err) {
                console.log(err.message)
                if (err.message === 'User rate limit exceeded.') {
                    return await sleep(30 * 60 * 1000);
                }
                if (err.message === "The file limit for this shared drive has been exceeded.") {
                    var { token } = results
                    var new_folder = await createNewTeamDrive(token)
                    if (new_folder) {
                        console.log('wait 5 seconds...')
                        await sleep(5000)
                        console.log('create new folder')
                        await changeFolder(new_folder)
                        return module.exports.uploadToDrive(drive_id, user_id)
                    }
                }
                return reject(new Error(`${drive_id} is upload fail. Error: ${err.message}`))
            }
        })
    }
}