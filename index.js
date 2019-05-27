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


//글 저장
app.post('/booking', (req, res) => {
    console.log(req.originalUrl);

    // facebook token
    var id = req.body.user_id;
    var token = req.body.token;
    // twitter token
    var tvn = req.body.twitter.tvn;
    var cgv = req.body.twitter.cgv;
    // posting contents
    var message = req.body.message;
    var bookingTime = req.body.bookingTime;
    var photo = req.body.photo;

    // photo 있을 때 없을 때 나누기
    var query = `INSERT INTO booking (uid, token, tvn, cgv, bookingTime, message, photo) VALUES ('${id}', '${token}', '${tvn}', '${cgv}', '${bookingTime}', '${message}', '${photo}')`;

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

// 지역 설정
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

// 예약 전송
// 30분마다 실행 => 현재 1분마다 실행
var j = schedule.scheduleJob('*/1 * * * *', (res) => {
    var facebook_finish = 0;
    var facebook_finish_info = '';
    var is_facebook_posting = 0;
    var twitter_finish = 0;
    var twitter_finish_info = '';
    var is_twitter_posting = 0;


    var query = `SELECT uid, token, tvn, cgv, message, bookingTime, photo
                FROM booking
                WHERE bookingTime = ${moment().format('YYYYMMDDHHmm')}`;

    console.log(query);

    conn.query(query, (err, rows) => {

        if (err) {
            console.log(err);
        } else {
            var jsonp = '';

            for (let i = 0; i < rows.length; i++) {
                // facebook posting
                if (rows[i].token) {
                    posting.facebook_uploading(rows[i].photo, rows[i].message, rows[i].uid, rows[i].token, facebook_finish, twitter_finish, facebook_finish_info, twitter_finish_info, is_twitter_posting, is_facebook_posting, (data) => {
                        facebook_finish_info += data;
                        if (facebook_finish_info == '')
                            jsonp = JSON.parse('{"facebook":"' + facebook_finish_info + '","twitter":' + JSON.stringify(twitter_finish_info) + '}');
                        else
                            jsonp = JSON.parse('{"facebook":' + facebook_finish_info + ',"twitter":' + JSON.stringify(twitter_finish_info) + '}');
                        facebook_finish = 1;
                    });
                }

                // twitter posting
                if (rows[i].tvn && rows[i].cgv) {
                    posting.twitter_posting_i_m(rows[i].message, rows[i].photo, facebook_finish, twitter_finish, facebook_finish_info, twitter_finish_info, is_twitter_posting, is_facebook_posing, rows[i].tvn, rows[i].cgv, (data) => {
                        console.log('twitter finish_info data' + JSON.stringify(data));
                        twitter_finish_info = data;
                        if (facebook_finish_info == '')
                            jsonp = JSON.parse('{"facebook":"' + facebook_finish_info + '","twitter":' + JSON.stringify(twitter_finish_info) + '}');
                        else
                            jsonp = JSON.parse('{"facebook":' + facebook_finish_info + ',"twitter":' + JSON.stringify(twitter_finish_info) + '}');

                        console.log(jsonp);

                        twitter_finish = 1;

                    });
                }
            }
        }
    });
});

function postingSave(uid, token, postId) {
    var query = `UPDATE booking SET bookingcol = '${postId}'
                WHERE uid = '${uid}' AND token = '${token}'`;
    console.log(query);

    conn.query(query, (err) => {
        console.log('Updating query');
        if (err) {
            res.json({
                status: 'fail',
                result: err,
            });
        } else {
            res.send('Update Success');
        }
    });
}

