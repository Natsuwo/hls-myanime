const fs = require('fs')
//
const { deleteFile, deleteFileError } = require('./middleware/Delete')
const { downloadDrive } = require('./middleware/Download')
const { renderThumb, renderVideo } = require('./middleware/Render')
const { uploadThumbnail } = require('./middleware/UploadThumb')
const { uploadToDrive } = require('./middleware/Upload')

var start = async (drive_id, user_id) => {
    await downloadDrive(drive_id, user_id).then(async () => {
        await renderThumb(drive_id, user_id)
        await uploadThumbnail(drive_id, user_id)
        await renderVideo(drive_id, user_id)
        await uploadToDrive(drive_id, user_id)
        await deleteFile(drive_id, user_id)
    }).catch(async (err) => {
        if(err) {
            await fs.appendFileSync('./logs/errors.log', `${new Date} ${err.message}\n`, { encoding: 'utf8' });
        }
        await deleteFileError(drive_id, user_id)
    })

    // Upload

}

module.exports.startTool = start