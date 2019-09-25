// For download
const md5 = require('md5')
const fs = require('fs')
const request = require('request')
const axios = require('axios')
const progress = require('request-progress')
const SERVER_IP = process.env.SERVER_IP
const { DownloaderHelper } = require('node-downloader-helper')
const { pauseResumeTimer, getQueryVariable, byteHelper } = require('./helpers')

module.exports = {
    // Download
    async downloadDrive(drive_id, user_id) {
        const Api = axios.create({
            baseURL: SERVER_IP,
            headers: { user_id, drive_id, access_key: process.env.ACCESS_KEY }
        })
        return new Promise(async (resolve, reject) => {
            try {
                var isDownloaded = await Api.get('/v2/hls/check-drive')
                if (isDownloaded.data.results.deleted) return reject(new Error(`${drive_id} is deleted.`))
                if (isDownloaded.data.results.downloaded) return resolve()
                // Download
                var fileName = md5(drive_id)
                var dir = `./files`
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }
                var downloadData = (await axios.post(`https://drive.google.com/uc?id=${drive_id}&confirm=jYel&authuser=0&export=download`, this.data, {
                    headers: {
                        'Accept': '*/*',
                        'Accept-encoding': 'gzip, deflate, br',
                        'Accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
                        'Content-length': 0,
                        'Content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
                        'Origin': 'https://drive.google.com',
                        'Referer': 'https://drive.google.com/drive/my-drive',
                        'User-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
                        'X-chrome-connected': 'id=102224796319835333482,mode=0,enable_account_consistency=false',
                        'X-client-data': 'CIa2yQEIpbbJAQipncoBCKijygEYkqPKAQ==',
                        'X-drive-first-party': 'DriveWebUi',
                        'X-json-requested': 'true',
                    }
                })).data
                var downloadResult = downloadData.replace(')]}\'\n', '')
                downloadResult = JSON.parse(downloadResult)
                // If Error
                if (downloadResult.sizeBytes > 10737418240) throw Error(`Your file: ${drive_id} has more than 10Gb, Please only add file less than 10Gb.`)

                // Add cookie downloading
                var currDownload = fs.readFileSync('./logs/download.json', 'utf8')
                var json = JSON.parse(currDownload)
                var isHas = json.filter(x => x.drive_id === drive_id)[0]
                if (!isHas) {
                    json.push({ drive_id, user_id })
                    fs.writeFileSync('./logs/download.json', JSON.stringify(json), 'utf8')
                }

                if (downloadResult.scanResult === 'ERROR' || !downloadResult.downloadUrl) {
                    var video_info = await axios.get(`https://drive.google.com/get_video_info?docid=${drive_id}`)
                    var cookie = video_info.headers['set-cookie'][0]
                    var fmt_stream_map = getQueryVariable(video_info.data, 'fmt_stream_map')
                    if (!fmt_stream_map) throw Error('File Error')
                    var maps = fmt_stream_map.split("%2C");
                    var purl = "";
                    var ans = {}

                    for (var x in maps.sort((a, b) => b - a)) {
                        var res = decodeURIComponent(decodeURIComponent(maps[x])).split('|');
                        if (!res[0]) {
                            continue;
                        }
                        purl = res[1];
                        var quality = ""
                        switch (parseInt(res[0])) {
                            case 18:
                                quality = '360p';
                                break;
                            case 59:
                                quality = '480p';
                                break;
                            case 22:
                                quality = '720p';
                                break;
                            case 37:
                                quality = '1080p';
                                break;
                        }
                        ans[quality] = purl;
                    }

                    var downloadUrl = ans['1080p']
                    if (!ans['1080p']) {
                        downloadUrl = ans['720p']
                    }
                    if (!ans['720p']) {
                        downloadUrl = ans['480p']
                    }
                    if (!ans['480p']) {
                        downloadUrl = ans['360p']
                    }
                    if (!downloadUrl) throw Error('File Error')

                    var options = {
                        retry: { maxRetries: 3, delay: 3000 },
                        override: true,
                        headers: {
                            Cookie: cookie
                        },
                        fileName: `${fileName}.mp4`
                    }

                    var url = downloadUrl;
                    var dl = new DownloaderHelper(url, './files/', options);
                    dl
                        .on('download', () => pauseResumeTimer(dl, 3000))
                        .on('end', async () => {
                            console.log('Download completed.')
                            await Api.post('/v2/hls/update-drive', { downloaded: true })
                            return resolve()
                        })
                        .on('error', (err) => {
                            throw Error(err.message)
                        })

                    console.log('Downloading: ', drive_id);
                    dl.start();

                } else {
                    options = {
                        url: downloadResult.downloadUrl
                    }
                    // Download
                    console.log(`Downloading ${drive_id}`)
                    progress(request(options), {
                    }).on('progress', function (state) {
                        // console.log('downloading %j %', state.percent * 100)
                    }).on('error', async function (err) {
                        throw Error(err.message)
                    }).on('end', async function () {
                        console.log('Download completed.')
                        await Api.post('/v2/hls/update-drive', { downloaded: true })
                        return resolve()
                    }).pipe(fs.createWriteStream(`${dir}/${fileName}.mp4`))
                }

            } catch (err) {
                console.log(err.message)
                await Api.post('/v2/job/add-message', { message: `Your file: ${drive_id} can't download.` })
                return reject(new Error(`${drive_id} is download fail.`))
            }
        })
    }
}