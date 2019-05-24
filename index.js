const https = require('https');
const mysql = require('mysql');
const express = require('express');
const db_config = require('./db_config');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('port', 3322);
app.listen(app.get('port'), () => console.log('Twice server listening on port ' + app.get('port') + ' port'));

var con = mysql.createConnection(db_config);

con.query('SET GLOBAL connect_timeout=28800');
con.query('SET GLOBAL wait_timeout=28800');
con.query('SET GLOBAL interactive_timeout=28800');

//글 저장
app.post('/booking', (req, res) => {
    //console.log(req.originalUrl);

    var id = req.body.user_id;
    var token = req.body.token;
    var message = req.body.message;
    var bookingTime = req.body.bookingTime;
    // ... --> video
    var query = `INSERT INTO booking (uid, token, bookingTime, message) VALUES (${id}, ${token}, ${bookingTime}, ${message})`;
    console.log(query);
    con.query(query, (err) => {
        console.log('inserting query');
        if(err) {
            res.json({
                status: 'fail',
                result: err,
            });
        } else {
            res.send('success');
        }
    })    
});