var https = require("https");
var querystring = require("querystring");
var express=require('express');
var app=express();
var buffer = require('buffer');
var path = require('path');
var fs = require('fs');
var async = require('async');
var Twitter = require('twitter');

app.use(express.json({limit: '100mb'}));
app.use(express.urlencoded({limit: '1000mb',extended:true}));
app.use('/public',express.static('public'));

function decodeimage(access_image,filename,callback1){
    
    var buf = Buffer.from(access_image,'base64');
        fs.writeFile(path.join(__dirname,'/public/',filename+'.mp4'), buf, function(error){
        if(error){
            throw error;
        }else{
            callback1(__dirname+'/public/'+filename+'.mp4');
    }
    }); 
}
function postingVideof(r_message,r_post_id,r_token,video,videocallback){
    data = querystring.stringify({
        description : r_message,
        file : video,
        posting_id : r_post_id,
        access_token : r_token
    })
    
    var options = {
        host: 'graph.facebook.com',
        port: 443,
        path: '/v3.3/'+`${r_post_id}`+'/videos',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 
            'Content-Length': Buffer.byteLength(data)
        }
    };

    var httpsreq = https.request(options, function(httpsres)
    {
        var postdata='';
        httpsres.setEncoding('utf8');
        httpsres.on('data', function (chunk) {
            postdata+=chunk;
        });
        httpsres.on('end',function(){
            videocallback(postdata);
        })
    });
    httpsreq.write(data);
    httpsreq.end();
}

app.post('/base64_test',function(req, res) {
    console.log('#base64');
    file = req.body.video;
    postingid = req.body.facebook[0].page_id;
    filename = postingid;

    async.waterfall([
        function(callback){ // image에 대하여 decode 과정이 필요
            var filename = r_posting_id+"_"+i;
            
            decodeimage(file,filename,function(file_url){
                callback(null,file_url);
            });
        },
        function(file_url,callback){
            video = require('fs').readFileSync(file_url);
            facebook_page_count = Object.keys(r_images).length;

            for(i = 0; i<facebook_page_count;i++){
                postingVideof(req.body.message,req.body.postingid,req.body.facebook[i].access_token,video,function(resultd){
                    if(i == facebook_page_count)
                        res.send(resultd)
                })
            }
        }
    ])
    
    postingVideof();

});

app.listen(8090);

