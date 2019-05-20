var https = require("https");
var qs = require("querystring");
var express=require('express');
var app=express();

app.post('/',function(req, res) {
    
    console.log(req.originalUrl); 
    r_access_token = req.query.access_token;
    r_message = req.query.message;

    var url = '/feed/?message='+`${r_message}`+'&access_token='+`${r_access_token}`;
    var resurl = encodeURI(url);
    var options = {
        host: 'graph.facebook.com',
        port: 443,
        path: resurl,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        query: {
            message:r_message,
            access_token:r_access_token,
        }
    };

    var httpreq = https.request(options, function(httpres)
    {
        var data='';
        httpres.setEncoding('utf8');
        httpres.on('data',function(chunk){
            console.log(chunk);
            data += chunk;
        })
        httpres.on('end',function(){
            res.send(data);
        })
    });
    httpreq.end()

    
});



app.listen(8090);