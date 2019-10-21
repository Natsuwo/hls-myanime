const fs = require('fs')
const uuidv4 = require('uuid/v4')
const { google } = require('googleapis')
const { DH_STATES } = require('node-downloader-helper')

module.exports.byteHelper = function (value) {
    if (value === 0) {
        return '0 b';
    }
    const units = ['b', 'kB', 'MB', 'GB', 'TB'];
    const number = Math.floor(Math.log(value) / Math.log(1024));
    return (value / Math.pow(1024, Math.floor(number))).toFixed(1) + ' ' +
        units[number];
};

module.exports.pauseResumeTimer = function (_dl, wait) {
    setTimeout(() => {
        if (_dl.state === DH_STATES.FINISHED ||
            _dl.state === DH_STATES.FAILED) {
            return;
        }

        _dl.pause()
            .then(() => setTimeout(() => {
                if (!_dl.isResumable()) {
                    console.warn("This URL doesn't support resume, it will start from the beginning");
                }
                return _dl.resume();
            }, 500));

    }, wait);
};

module.exports.getQueryVariable = function (query, variable) {
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            //return decodeURIComponent(pair[1]);
            return pair[1];
        }
    }
    console.log('Query variable %s not found', variable);
    return "";
};

module.exports.createNewTeamDrive = async function (token) {
    try {
        const oauth2Client = new google.auth.OAuth2()
        oauth2Client.setCredentials({
            'access_token': token
        });
        const driveService = google.drive({
            version: 'v3',
            auth: oauth2Client
        });
        var uuid = uuidv4();
        var driveMetadata = {
            'name': 'DRSTREAM ' + uuid
        };
        var requestId = uuid
        var teamdrive = await driveService.drives.create({
            resource: driveMetadata,
            requestId: requestId,
            fields: 'id'
        })
        var teamdriveId = teamdrive.data.id
        var emailAddress = [
            "animemlbackup02@gmail.com",
            "animemlbackup03@gmail.com",
            "animemlbackup04@gmail.com",
            "animemlbackup06@gmail.com",
            "animemlbackup07@gmail.com",
            "animemlbackup08@gmail.com",
            "animemlbackup09@gmail.com",
            "znatsu@fuyufs.com"]

        for (email of emailAddress) {
            var userData = { 'type': 'user', 'role': 'fileOrganizer', 'emailAddress': email };
            driveService.permissions.create({
                resource: userData,
                fields: 'id',
                fileId: teamdriveId,
                supportsTeamDrives: true
            }, function (err, user) {
                if (err) {
                    console.error(err.message);
                } else {
                    console.log(user.data.id)
                }
            });
            await delay(1000)
        }
        return teamdriveId
    } catch (err) {
        return false
    }
};

module.exports.changeFolder = async function (new_folder) {
    try {
        var auth = fs.readFileSync("./folder.json", { encoding: "utf8" })
        var jsonData = JSON.parse(auth)
        jsonData[0] = new_folder
        fs.writeFileSync("./folder.json", JSON.stringify(jsonData), { encoding: "utf8" })
    } catch (err) {
        return false
    }
};