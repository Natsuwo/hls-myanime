'use strict';

module.exports = (rootDir) => {
    const cookieParser = require('cookie-parser')
    const express = require('express')
    const app = express()
    const bodyParser = require('body-parser')
    const router = require('./routes')

    // App Use
    app.use(cookieParser())
    app.use('/files', express.static('files'))
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use('/api', router)

    app.use((err, req, res, next) => {
        if (err) {
            return res.status(403).send({ success: false, error: err.message });
        }
        next();
    });

    const { resumeDownload } = require('./task')
    resumeDownload()

    return app;
}