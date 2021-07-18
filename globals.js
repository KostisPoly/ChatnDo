const moment = require('moment');
const mysql = require('mysql')

const mysqlConn = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'nodelogin'
});

function messageFormat(user, text) {
    return {
        user,
        text,
        time: moment().format('dddd, h:mm a')
    }
}

function intervalCheck(){

    setInterval(() => {
        mysqlConn.query('SELECT * FROM accounts WHERE online = 1',
        (error, results, fields) => {
            if (results.length > 0) {
                results.forEach(element => {
                    const fieldTime = moment(element.timestamp);
                    const now = moment();
                    if(now.diff(fieldTime, 'minutes') > 1) {
                        mysqlConn.query('UPDATE accounts SET online = ? WHERE id = ?',
                        [0, element.id],
                        (error, results, fields) => {
                        console.log(results);
                        })
                    }
                    
                });
                
            } else {
                console.log("No user to unset online!");
            }			
        });
    }, 60000);
}

module.exports = {
    messageFormat,
    intervalCheck
}