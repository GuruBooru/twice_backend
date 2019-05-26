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

var this_url = 'http://100.24.24.64:3355'



//FACEBOOK POSTING//
function messageData(r_message,r_token){
     data= querystring.stringify({
        message : r_message,
        access_token : r_token,
     });

     var options = {
        host: 'graph.facebook.com',
        port: 443,
        path: '/feed',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    var httpreq = https.request(options, function(httpres)
    {
        var postdata='';
        httpres.setEncoding('utf8');
        httpres.on('data', function (chunk) {
            console.log("body: " + chunk);
            postdata+=chunk;
        });
        httpres.on('end',function(){
            return postdata;
        })
    });
    httpreq.write(data);
    httpreq.end();
}

function photosData(r_url,r_token,r_post_id,r_message){
    data= querystring.stringify({
       url : this_url + r_url,
       access_token : r_token,
       posting_id : r_post_id,
       message : r_message
    });

    var options = {
        host: 'graph.facebook.com',
        port: 443,
        path: '/'+`${r_post_id}`+'/photos',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    var httpreq = https.request(options, function(httpres)
    {
        var postdata='';
        httpres.setEncoding('utf8');
        httpres.on('data', function (chunk) {
            console.log("body: " + chunk);
            postdata+=chunk;
        });
        httpres.on('end',function(){
            return postdata;
        })
    });
    httpreq.write(data);
    httpreq.end();
    
}
/*
function decoded(base64str,filename){
        var buf = Buffer.from(base64str,'base64');
      
        fs.writeFile(path.join(__dirname,'/public/',filename+'.jpg'), buf, function(error){
          if(error){
            throw error;
          }else{
            return __dirname+'/public/'+filename+'.jpg';
          }
        }); 
}
*/
function multiphotosData(r_url,r_token,r_post_id,r_message,callback){
    console.log(r_url)
    data = querystring.stringify({
        message : r_message,
        url : this_url + r_url,
        published :'false',
        posting_id : r_post_id,
        access_token : r_token
    })
    
    var options = {
        host: 'graph.facebook.com',
        port: 443,
        path: '/'+`${r_post_id}`+'/photos',
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
            console.log(postdata);
            callback(postdata)
        })
    });
    httpsreq.write(data);
    httpsreq.end();
}

//facebook에 실제로 올리는 function // 임시저장 게시물을 묶어서 보내는 형태
function postingMultiphotosData(r_message,r_post_id,r_token,idlist,r_res){
    data = querystring.stringify({
        message : r_message,
        attached_media : idlist,
        posting_id : r_post_id,
        access_token : r_token
    })
    
    var options = {
        host: 'graph.facebook.com',
        port: 443,
        path: '/'+`${r_post_id}`+'/feed',
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
            console.log(chunk);
        });
        httpsres.on('end',function(){
            
            //r_res.json(postdata);
            //return postdata;
        })
    });
    httpsreq.write(data);
    httpsreq.end();
}

function decodeimage(access_image,filename,num,callback){
    // var url_image = '/public/'+filename+'.jpg';
    var buf = Buffer.from(access_image,'base64');
        fs.writeFile(path.join(__dirname,'/public/',filename+'.jpg'), buf, function(error){
        if(error){
            throw error;
    }else{
        callback('/public/'+filename+'.jpg');
    }
    }); 
}
//facebook multi 관련 총괄 function
function posting_data_in_facebook(imagearray,r_message,r_posting_id,r_token,num,r_res){
    postingidlist=[];
    count = Object.keys(imagearray).length;
    postingobject = []
    
    for(i=0;i<count;i++){
        
        async.waterfall([
            function(callback){ // image에 대하여 decode 과정이 필요
                var filename = r_posting_id+"_"+i+'_'+num;
                decodeimage(imagearray[i],filename,num,function(url_image){
                    callback(null, url_image)
                });
            },
            function(url_image,callback){
                callback(null, url_image)
            },
            function(url_image,callback){
                postingidlist=[];
                multiphotosData(url_image, r_token,r_posting_id,r_message,function(dres){
                    console.log('chunk' + dres);
                    callback(null,dres);
                })
            },
            function(test,callback){
                testc= JSON.parse(test);
                
                temp = {media_fbid:testc.id};
                postingobject.push(temp);
                if(postingobject.length==count){
                    postingMultiphotosData(r_message,r_posting_id,r_token,JSON.stringify(postingobject));
                }
                callback(null,postingidlist)
            },function(postinglist,callback){
                //r_res.json()
            }
        ])
    }
}




function facebook_uploading(r_images,r_message,r_posting_id,r_token,res){
        console.log('#facebook_posting')
        // count로 변경하기 
        imagecount = Object.keys(r_images).length;
        /*
        if(count==1){ // 하나의 이미지에 대해서 전송하는 경우 
            console.log('#one_image_post');
            var access_image = req.body.image; //image base64
            var filename = posting_id+"_"+1;
            
            //image formating and post url 
            async.waterfall([
                function(callback){
                    var url_image = '/public/'+filename+'.jpg';
                     var buf = Buffer.from(access_image,'base64');
                        fs.writeFile(path.join(__dirname,'/public/',filename+'.jpg'), buf, function(error){
                        if(error){
                            throw error;
                    }else{
                        return __dirname+'/public/'+filename+'.jpg';
                    }
                    }); 
                    callback(null, url_image)
                },
                function(url_image,callback){
                    result = photosData(url_image, req.body.facebook.token,req.body.facebook.posting_id,req.body.facebook.data[0].message)
                    callback(null,result);
                },
                function(err,result){
                    res.json(result);
                }
            ])
        }
        else
        */ 
        if(imagecount!=0){ // multi image 
            console.log('#posting multi image')
            posting_data_in_facebook(r_images,r_message,r_posting_id,r_token,res)  //정보를 통해서 사진 올리고 facebook 에 업로드 하는 함수
        }
        else{ //image가 없는 경우
            console.log('#message');
            async.waterfall([
                function(callback){
                    result = messageData(r_message,r_token)
                    callback(null, result)
                },
                function(err, result){            
                    res.json(result);
                }
            ])
        }  
    
}


function saveImageToDisk(url, localPath) {var fullUrl = url;
    var file = fs.createWriteStream(localPath);
    var request = https.get(url, function(response) {
    response.pipe(file);
    });
}



//TWITTER POSTING//
//access_token이 받는 부분인것 같기도하고... //access token 부분은 후에 수정하기
CONSUMER_KEY = 'L5nSnLJQZnHIeWvFqXgCOfTYE'
CONSUMER_SECRET ='s5dVuVbQRi7NaJ0Gl6oAOC1nu3ab9wNMQpB4gWk9yyZgJJSqzc'
ACCESS_TOKEN = '1093422729988960256-6qfauDfkxEZzhhE2ncDcLTpQrRQZth'
TOKEN_SECRET = 'Lnbqbk4To9HWb29F5nVGN5DBVVBjFha1lTJqn03nOOxgY'


function twitter_posting_i_m(r_status,r_images){ 
    var client = new Twitter ({
        consumer_key : CONSUMER_KEY,
        consumer_secret : CONSUMER_SECRET,
        access_token_key : ACCESS_TOKEN,
        access_token_secret : TOKEN_SECRET
    });
    image_count = Object.keys(r_images).length;
    if(image_count == 0){ // image non
        console.log('#twitter_non image posting')
        client.post('statuses/update',{status : r_status},function(error, tweet, response){
            if (error) res.json(error);
            else {res.json(tweet)};
            //console.log(tweet);
            //console.log(response);
        })
    }else{ // multi_image
        console.log('#twitter_image posting')
        async.waterfall([
            function(callback){
                //console.log(req.body.twitter)
                result = posting_twitter(client,r_status,r_images)
                callback(null, result)
            },
            function(err,result){            
                //res.json(err);
            }
        ])
    }
}
function posting_twitter(client,r_message,r_images){
    var image_ids_t=''
    count = Object.keys(r_images).length;
    
    for(i=0; i<count; i++){
        (function(i,count,r_images,r_message,client){
            client.post('media/upload', {media_data: r_images[i]}, function(error, media, response) {
                if (!error) {
                    console.log(i);
                    console.log(image_ids_t)
                    if(image_ids_t == ''){
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




//POSTING API//
app.post('/facebook_page',function(req, res) {
    console.log('facebook_page is connected')
    if(req.body.time){ // 저장인 경우
            //facebook에 올리는 작업에 필요한 것들 db에 저장하기 imagearray/message/posting_id/token/time/
            //나중에 아래의 함수를 통해서 facebook에 업로드 하기
    }
    else{
        if(req.body.facebook){ // facebook 인경우
            console.log('#facebook page is start');

            count = Object.keys(req.body.facebook.data).length;
            console.log(count);

            for(i = 0; i<count;i++){
                facebook_uploading(req.body.facebook.data[i].images,req.body.facebook.data[i].message,req.body.facebook.data[i].posting_id,req.body.facebook.data[i].token,i,res)
            }

        }
        if(req.body.twitter){
            console.log('#twitter page is start');
            twitter_posting_i_m(req.body.twitter.data[0].message,req.body.twitter.data[0].images);
        }
    }
    res.json('success');
});




app.listen(3355);

module.exports = {
    facebook_uploading,
    
}