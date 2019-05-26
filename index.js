const bodyParser = require('body-parser');
const mysql = require('mysql');
const express = require('express');
const db_config = require('./db_config');
const schedule = require('node-schedule');
const posting = require('./posting.js');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('port', 3322);
app.listen(app.get('port'), () => console.log('Booking listening on port ' + app.get('port') + ' port'));

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
var j = schedule.scheduleJob('*/1 * * * *', (res) => {
    var query = `SELECT uid, token, message, bookingTime, photo
                FROM booking
                WHERE bookingTime = ${moment().format('YYYYMMDDHHmm')}`;

    console.log(query);

    conn.query(query, (err, rows) => {

        if (err) {
            console.log(err);
        } else {
            for (let i = 0; i < rows.length; i++) {
                posting.facebook_uploading(rows[i].photo, rows[i].message, rows[i].uid, rows[i].token, res);
            }
        }
    });
});

//글 저장
app.post('/booking', (req, res) => {
    console.log(req.originalUrl);

    var id = req.body.user_id;
    var token = req.body.token;
    var message = req.body.message;
    var bookingTime = req.body.bookingTime;
    var photo = req.body.photo;

    // photo 있을 때 없을 때 나누기
    var query = `INSERT INTO booking (uid, token, bookingTime, message, photo) VALUES ('${id}', '${token}', '${bookingTime}', '${message}', '${photo}')`;
    console.log(query);
    conn.query(query, (err) => {
        console.log('inserting query');
        if (err) {
            res.json({
                status: 'fail',
                result: err,
            });
        } else {
            res.send('success');
        }
    })
});