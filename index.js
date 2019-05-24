const https = require('https');
const mysql = require('mysql');
const express = require('express');
const db_config = require('./db_config');
const bodyParser = require('body-parser');
const schedule = require('node-schedule');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('port', 3322);
app.listen(app.get('port'), () => console.log('Twice server listening on port ' + app.get('port') + ' port'));

var con = mysql.createConnection(db_config);

//글 저장
app.post('/booking', (req, res) => {
    console.log(req.originalUrl);

    var id = req.body.user_id;
    var token = req.body.token;
    var message = req.body.message;
    var bookingTime = req.body.bookingTime;
    // ... --> video

    var query = `INSERT INTO booking (uid, token, bookingTime, message)
            VALUES (${id}, ${token}, ${bookingTime}, ${message})`;
    console.log(query);
    
    con.query(query, (err) => {
        if(err) {
            res.send({
                status: 'fail',
                result: err,
            });
        } else {
            res.json('success');
        }
    });
});




// 예약 전송
// var j = schedule.scheduleJob('* 30 * * * *', function() {
//     console.log(moment().format('YYYY-MM-DD-HH:mm'));
//     var query = `SELECT token, message, image
//                 FROM booking 
//                 WHERE bookingTime = ${mysql.escape(moment().format('YYYY-MM-DD-HH:mm'))}`;

//     conn.query(query).then(result => {
//         for (let i = 0; i < result.length; i++) {
//             // 데이터 분할
//             let token = result[i].token;
//             let message = result[i].message;
//             if(result[i].image) {
//                 let image = result[i].image;
//             }

//             // 전송
//             postingFacebook(token, message, image);
//         }
//     }).catch(error => {
//         console.log('Post Upload fail' + moment().format('YYYY-MM-DD-HH:mm'));
//     });
// });


function postingFacebook(token, message, image = null) {
    var url = `/feed/?message=${message}&access_token=${token}`;
    var resurl = encodeURI(url);
    var options = {
        host: 'graph.facebook.com',
        port: 443,
        path: resurl,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    };

    var httpreq = https.request(options, function (httpres) {
        var data = '';
        httpres.setEncoding('utf8');

        httpres.on('data', function (chunk) {
            console.log(chunk);
            data += chunk;
        })
        httpres.on('end', function () {
            res.send(data);
        })
    });
    httpreq.end()
}