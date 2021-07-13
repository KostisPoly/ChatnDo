const moment = require('moment');

function messageFormat(user, text) {
    return {
        user,
        text,
        time: moment().format('dddd, h:mm a')
    }
}

module.exports = {
    messageFormat
}