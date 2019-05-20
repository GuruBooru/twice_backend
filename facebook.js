var https = require("https");
var qs = require("querystring");
var express=require('express');
var app=express();

// facebook
app.post('/',function(req, res) {
    
    console.log(req.originalUrl); 
    r_access_token = req.query.access_token;
    r_message = req.query.message;

    var options = {
        host: 'graph.facebook.com',
        port: 443,
        path: '/feed?message='+r_message+'&access_token='+r_access_token,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
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
        
// twitter
// instagram
// 댓글