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


//access_token이 받는 부분인것 같기도하고...
CONSUMER_KEY = 'L5nSnLJQZnHIeWvFqXgCOfTYE'
CONSUMER_SECRET ='s5dVuVbQRi7NaJ0Gl6oAOC1nu3ab9wNMQpB4gWk9yyZgJJSqzc'
ACCESS_TOKEN = '1093422729988960256-6qfauDfkxEZzhhE2ncDcLTpQrRQZth'
TOKEN_SECRET = 'Lnbqbk4To9HWb29F5nVGN5DBVVBjFha1lTJqn03nOOxgY'
function touth(){
      requset.post()
}


app.post('/tweete_page',function(req,res){
    
    var client = new Twitter ({
        consumer_key : CONSUMER_KEY,
        consumer_secret : CONSUMER_SECRET,
        access_token_key : ACCESS_TOKEN,
        access_token_secret : TOKEN_SECRET
    });
    client.post('statuses/update',{status : req.body.twitter.data[0].status},function(error, tweet, response){
        if (error) res.json(error);
        else {res.json(tweet)};
        console.log(tweet);
        console.log(response);
    })
})


app.post('/twitter_media',function(req,res){
    console.log('이거');
    // Load your image
    var client = new Twitter ({
        consumer_key : CONSUMER_KEY,
        consumer_secret : CONSUMER_SECRET,
        access_token_key : ACCESS_TOKEN,
        access_token_secret : TOKEN_SECRET
    });

 //   var t_images = req.body.twitter.data[0].images;
//    data_0 = require('fs').readFileSync('./public/2342358919319255_1.jpg');
//    data_1 = require('fs').readFileSync('./public/2342358919319255_1.jpg');
    

    async.waterfall([
        function(callback){
            console.log(req.body.twitter)
            result = posting_twitter(client,req.body.twitter.data[0].message,req.body.twitter.data[0].images)
            callback(null, result)
        },
        function(err,result){            
            res.json(err);
        }
    ])
})

function post_data_t(r_media_ids,r_message){ //callback
    data = querystring.stringify({
         status:r_message,
         media_ids : r_media_ids
    })
    console.log(r_media_ids);
    
    var options = {
        host: 'api.twitter.com',
        port: 443,
        path: '/1.1/statuses/update.json',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(data),

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
            console.log(postdata);
            //callback(postdata)
        })
    });
    httpsreq.write(data);
    httpsreq.end();
}

function posting_twitter(client,r_message,r_images){
    var image_ids_t=''
    count = Object.keys(r_images).length;
    
    for(i=0; i<count; i++){
        (function(i,count,r_images,r_message,client){
            client.post('media/upload', {media_data: r_images[i]}, function(error, media, response) {
                if (!error) {
                    console.log(i);
                    if(i == 0){
                        image_ids_t += media.media_id_string;
                    }
                    else{
                        image_ids_t += (',' + media.media_id_string);
                    }
                    console.log('i'+i+'count'+ (count-1));
                    if(i == (count-1)){
                        console.log('statuses + '+image_ids_t);
                        //post_data_t(image_ids_t,r_message);
                        var status = {
                          status: r_message, //이거 변경하기
                          media_ids: image_ids_t // Pass the media id string
                        }
                        console.log(image_ids_t);
                        console.log(r_message)
                        console.log('update');
                        client.post('statuses/update', status, function(error, tweet, response) {
                            if (!error) {
                                  console.log(tweet);
                                  return (tweet);
                              }else{
                                  console.log(error);
                                  return (error);
                              }
                        });
                  
                    }
                
                }
                });
        })(i,count,r_images,r_message,client)
    }
}
app.listen(8090);