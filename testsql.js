var express=require('express');
var app=express();

var mysql = require('mysql');

var con = mysql.createConnection({
  host: '127.0.0.1',
  user: 'testuser',
  password: '1234',
  database : 'twice',
  port : '3306',
});

con.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    else console.log("Connected!");
});

app.listen(3200);