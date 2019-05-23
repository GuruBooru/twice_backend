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

    
    data_0 = require('fs').readFileSync('./public/2342358919319255_1.jpg');
    data_1 = require('fs').readFileSync('./public/2342358919319255_1.jpg');
    

// Make post request on media endpoint. Pass file data as media parameter
    client.post('media/upload', [{media: data_0},{media:data_1}], function(error, media, response) {
    if (!error) {

    // If successful, a media object will be returned.
    console.log(media);

    // Lets tweet it
    var status = {
      status: 'I am a tweet', //이거 변경하기
      media_ids: media.media_id_string // Pass the media id string
    }

    client.post('statuses/update', status, function(error, tweet, response) {
      if (!error) {
            console.log(tweet);
            res.json(tweet);
        }else{
            res.json(error);
        }
        });

    }
    });
})


app.listen(8090);