const mysql = require('mysql');
const express = require('express');
const db_config = require('./db_config');
const schedule = require('node-schedule');
const transfer = require('./facebook.js');

const app = express();
app.set('port', 3322);
app.listen(app.get('port'), () => console.log('Twice server listening'));

var conn = mysql.createConnection(db_config);

conn.query('SET GLOBAL connect_timeout=28800');
conn.query('SET GLOBAL wait_timeout=28800');
conn.query('SET GLOBAL interactive_timeout=28800');

// 지역 설정
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

// 예약 전송
// 30분마다 실행
var j = schedule.scheduleJob('*/30 * * * *', () => {
    var query = `SELECT token, message, bookingTime, photo
                FROM booking
                WHERE bookingTime = ${moment().format('YYYYMMDDHHmm')}`;

    console.log(query);

    conn.query(query, (err, rows) => {
        if(rows.length == 0){
            console.log(err);
        } else {
            for (let i = 0; i < rows.length; i++) {
                transfer.facebook_uploading(rows[i].photo, rows[i].message, rows[i].uid, rows[i].token);
            }
        }
    });
});
