const mysql = require('mysql');
const express = require('express');
const db_config = require('./db_config');
const schedule = require('node-schedule');
const moment = require('moment');

const app = express();
app.set('port', 3322);
app.listen(app.get('port'), () => console.log('Twice server listening'));

var conn = mysql.createConnection(db_config);

conn.query('SET GLOBAL connect_timeout=28800');
conn.query('SET GLOBAL wait_timeout=28800');
conn.query('SET GLOBAL interactive_timeout=28800');

// 예약 전송
// 30분마다 실행
var j = schedule.scheduleJob('*/1 * * * *', () => {
    var query = `SELECT token, message, bookingTime
                FROM booking
                WHERE bookingTime = ${moment().format('YYYYMMDDHHmm')}`

    conn.query(query, (err, rows) => {
        if(err){
            console.log(err);
        } else {
            for (let i = 0; i < rows.length; i++) {
                console.log(rows[i])
            }
        }
        // 전송
        // postingFacebook(token, message, image);
    });
});

// function postingFacebook(token, message, image = null) {
//     var url = `/feed/?message=${message}&access_token=${token}`;
//     var resurl = encodeURI(url);
//     var options = {
//         host: 'graph.facebook.com',
//         port: 443,
//         path: resurl,
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/x-www-form-urlencoded',
//         }
//     };

//     var httpreq = https.request(options, function (httpres) {
//         var data = '';
//         httpres.setEncoding('utf8');

//         httpres.on('data', function (chunk) {
//             console.log(chunk);
//             data += chunk;
//         })
//         httpres.on('end', function () {
//             res.send(data);
//         })
//     });
//     httpreq.end()
// }