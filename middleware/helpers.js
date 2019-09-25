const { DH_STATES } = require('node-downloader-helper');

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