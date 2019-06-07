var https = require("https");
var querystring = require("querystring");
var express = require('express');
var app = express();
var buffer = require('buffer');
var path = require('path');
var fs = require('fns');
var async = require('async');
var Twitter = require('twitter');
const mysql = require('mysql');
const schedule = require('node-schedule');
const db_config = require('./db_config');

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '1000mb', extended: true }));
app.use('/public', express.static('public'));

var this_url = 'http://100.24.24.64:8090'

var conn = mysql.createConnection(db_config);
conn.query('SET GLOBAL connect_timeout=28800');
conn.query('SET GLOBAL wait_timeout=28800');
conn.query('SET GLOBAL interactive_timeout=28800');

//POSTING API//
app.post('/facebook_page', function (req, res) {
    var facebook_finish = 0;
    var twitter_finish = 0;
    var facebook_finish_info = '';
    var twitter_finish_info = '';
    var is_twitter_posting = 0;
    var is_facebook_posting = 0;

    console.log(facebook_finish);
    console.log('facebook_page is connected')
    if (req.body.time) { // 저장인 경우
        console.log('this is time posting');
        //facebook에 올리는 작업에 필요한 것들 db에 저장하기 imagearray/message/posting_id/token/time/

        var insertInto = `INSERT INTO Booking (uid, bookingTime, message, photo`;
        var values = `VALUES ('${req.body.uid}', '${req.body.time}', '${req.body.message}', '${JSON.stringify(`${req.body.images}`)}'`;

        if (req.body.twitter) {
            insertInto += `, tvn, cgv`;
            values += `, '${req.body.twitter.tvn}', '${req.body.twitter.cgv}'`;
        }
        if (req.body.instagram) {
            insertInto += `, mbc`;
            values += `, '${req.body.instagram.mbc}'`;
        }

        if (req.body.facebook) {
            insertInto += `, facebookInfo`;
            var facebookInfo = '{ "data":[';
            for (i = 0; i < req.body.facebook.length; i++) {
                // facebookInfo += req.body.facebook[i];
                if(facebookInfo != '{ "data":[') {
                    facebookInfo += ',';
                }
                facebookInfo += `{"token" : "${req.body.facebook[i].token}"`;
                facebookInfo += `, "page_id" : "${req.body.facebook[i].page_id}"}`;
            }
            facebookInfo += ']}';
            //console.log(facebookInfo);
            values += `, '${JSON.stringify(`${facebookInfo}`)}'`;
        }
        insertInto += `)`; values += `)`;

        //console.log(insertInto);
        var query = insertInto + values;

        conn.query(query, (err) => {
            console.log('inserting facebook query');
            if (err) {
                console.log(err);
            } else {
                console.log('twice booking success');
                res.send('twice booking success');
            }
        });
    }
    else {
        isTime = 0;
        var jsonp = ''
        //console.log(req.body);
        if (req.body.facebook) { // facebook 인경우
            is_facebook_posting = 1;
            console.log('#facebook page is start');
            for (i = 0; i < req.body.facebook.length; i++) {
                facebook_uploading(req.body.images, req.body.message, req.body.facebook[i].page_id, req.body.facebook[i].token, facebook_finish, twitter_finish, facebook_finish_info, twitter_finish_info, is_twitter_posting, is_facebook_posting, function (data) {
                    console.log('facebook final' + data)
                    facebook_finish_info += data;
                    try {
                        if (facebook_finish_info == '')
                            jsonp = JSON.parse('{"facebook":"' + facebook_finish_info + '","twitter":' + JSON.stringify(twitter_finish_info) + '}');
                        else
                            jsonp = JSON.parse('{"facebook":' + facebook_finish_info + ',"twitter":' + JSON.stringify(twitter_finish_info) + '}');
                    } catch (e) {
                        console.log(e);
                    }
                    facebook_finish = 1;

                    if ((facebook_finish) & (is_twitter_posting == twitter_finish)) {
                        if (!isTime) {
                            console.log(jsonp);
                            try {
                                res.json(jsonp);
                            } catch (e) {
                                console.log(e);
                            }
                        }
                    }
                });
            }
        }
        if (req.body.twitter) {
            is_twitter_posting = 1;
            console.log('#twitter page is start');
            twitter_posting_i_m(req.body.message, req.body.images, facebook_finish, twitter_finish, facebook_finish_info, twitter_finish_info, is_twitter_posting, is_facebook_posting, req.body.twitter.tvn, req.body.twitter.cgv, function (data) {
                console.log('twitter finish_info data' + JSON.stringify(data));
                twitter_finish_info = data;
                try {
                    if (facebook_finish_info == '')
                        jsonp = JSON.parse('{"facebook":"' + facebook_finish_info + '","twitter":' + JSON.stringify(twitter_finish_info) + '}');
                    else
                        jsonp = JSON.parse('{"facebook":' + facebook_finish_info + ',"twitter":' + JSON.stringify(twitter_finish_info) + '}');
                    console.log(jsonp);

                } catch (e) {
                    console.log(e);
                }

                twitter_finish = 1;
                if ((facebook_finish == is_facebook_posting) & twitter_finish) {
                    if (!isTime) {
                        try {
                            res.json(jsonp);
                        } catch (e) {
                            console.log(e);
                        }
                    }
                }
            });
        }
    }
});


// 지역 설정
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

// 예약 전송
// 30분마다 실행 --> 현재 1분마다 실행
var j = schedule.scheduleJob('*/1 * * * *', (res) => {
    var facebook_finish = 0;
    var facebook_finish_info = '';
    var is_facebook_posting = 0;
    var twitter_finish = 0;
    var twitter_finish_info = '';
    var is_twitter_posting = 0;

    var query = `SELECT facebookInfo, tvn, cgv, message, bookingTime, photo
                FROM Booking
                WHERE bookingTime = ${moment().format('YYYYMMDDHHmm')}`;

    console.log(query);

    conn.query(query, (err, rows) => {
        if (err) {
            console.log(err);
        } else {
            // console.log('good');
            for (let i = 0; i < rows.length; i++) {

                // facebook posting
                if (rows[i].facebookInfo) {
                    console.log('facebook posting');
                    // infoJSON = JSON.parse(rows[i].facebookInfo);

                    subrows = rows[i].facebookInfo.substr(1).slice(0,-1)
                    console.log(subrows);
                    jsubrows = JSON.parse(subrows);
                    
                    console.log('#이분이 문제입니다' + jsubrows + 'length'+jsubrows.data.length);
                    
                    image_string = rows[i].photo;
                    if (image_string == '""') {
                        photos = [];
                    }
                    else {
                        console.log('#왜 undifined인건지,,'+rows[i].photo);
                        subpho = rows[i].photo.substr(1).slice(0,-1)
                        
                        photos = subpho.split(',');
                        console.log(photos);
                    }
                    
                    for(j = 0; j<jsubrows.data.length;j++){
                        //console.log('#facebook test' + photos[0]);
                        //console.log(rows[i].message+'j'+jsubrows.data[j].page_id,jsubrows.data[j].token);
                        facebook_uploading(photos, rows[i].message, jsubrows.data[j].page_id, jsubrows.data[j].token, 1, 1, 1, 1, 1, 1, (data) => {
                            console.log(data);
                            /*facebook_finish_info += data;
                            
                            if (facebook_finish_info == '')
                                jsonp = JSON.parse('{"facebook":"' + facebook_finish_info + '","twitter":' + JSON.stringify(twitter_finish_info) + '}');
                            else
                                jsonp = JSON.parse('{"facebook":' + facebook_finish_info + ',"twitter":' + JSON.stringify(twitter_finish_info) + '}');
                            */
                           facebook_finish = 1;
                        });
                    }
                }

                //  twitter posting
                if (rows[i].tvn && rows[i].cgv) {
                    console.log('twitter posting');
                    image_string = rows[i].photo;
                    if (image_string == '""') {
                        photos = [];
                    }
                    else {
                        photos = image_string.split(',');
                    }
                    twitter_posting_i_m(rows[i].message, photos, facebook_finish, twitter_finish, facebook_finish_info, twitter_finish_info, is_twitter_posting, is_facebook_posting, rows[i].tvn, rows[i].cgv, (data) => {
                        //console.log('twitter finish_info data' + JSON.stringify(data));
                        twitter_finish_info = data;
                        /*if (facebook_finish_info == '')
                            jsonp = JSON.parse('{"facebook":"' + facebook_finish_info + '","twitter":' + JSON.stringify(twitter_finish_info) + '}');
                        else
                            jsonp = JSON.parse('{"facebook":' + facebook_finish_info + ',"twitter":' + JSON.stringify(twitter_finish_info) + '}');
                        */
                        twitter_finish = 1;

                    });
                }
            }
        }
    });
});

// 게시글 삭제
// 사용자 게시글 전체 삭제
app.post('/destroy', (req, res) => {
    console.log(req.originalUrl);

    var query = `DELETE FROM Booking 
                WHERE uid = '${req.query.uid}'`;

    conn.query(query, (err) => {
        console.log('Delete Rows');
        if (err) {
            res.json({
                status: 'fail',
                result: err,
            });
        } else {
            res.send('success');
        };
    });
});

// 사용자 지정 게시글 전송
app.post('/check_post', (req, res) => {
    console.log(req.query.uid);

    var query = `SELECT bookingNo, uid, message, bookingTime, facebookInfo, tvn, mbc 
                FROM Booking 
                WHERE uid = '${req.query.uid}' 
                AND bookingTime > '${moment().format('YYYYMMDDHHmm')}'`;
    console.log(moment().format('YYYYMMDDHHmm'))

    conn.query(query, (err, rows) => {
        console.log('select delete');
        if (err) {
            console.log('fail');
            res.json({
                status: 'fail',
                result: err,
            });
        } else {
            console.log('check_post success' + rows.length);
            json_string = '{ "data":[';
            console.log(rows.length);
            for (i = 0; i < rows.length; i++) {
                if (i != 0) {
                    json_string += ',';
                }
                json_string += `{"post_id" :  "${rows[i].bookingNo}"`;
                // json_string += `,"uid" : '  "${rows[i].uid}"`;
                json_string += `,"message" :  "${rows[i].message}"`;
                json_string += `,"bookingTime" :  "${rows[i].bookingTime}"`;
                if (rows[i].facebookInfo) {
                    json_string += ',"facebook" : true';
                } else {
                    json_string += ',"facebook" : false';
                }
                if (rows[i].tvn) {
                    json_string += ',"twitter" : true';
                } else {
                    json_string += ',"twitter" : false';
                }
                if (rows[i].mbc) {
                    json_string += ',"instagram" : true';
                } else {
                    json_string += ',"instagram" : false';
                }
                json_string += '}';
            }
            json_string += ']}'

            console.log(json_string);

            res.json(JSON.parse(json_string));
        }
    });
});

// 사용자 지정 게시글 삭제
app.post('/delete', (req, res) => {
    console.log(req.originalUrl);

    var query = `DELETE FROM booking 
                WHERE uid = '${req.query.uid}' 
                AND bookingNo = '${req.query.post_id}'`;

    conn.query(query, (err) => {
        console.log('Delete query');
        if (err) {
            res.json({
                status: 'fail',
                result: err,
            });
        } else {
            res.send('success');
        }
    });
});



//FACEBOOK POSTING//
function messageData(r_message, r_token, callback3) {
    data = querystring.stringify({
        message: r_message,
        access_token: r_token,
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

    var httpreq = https.request(options, function (httpres) {
        var postdata = '';
        httpres.setEncoding('utf8');
        httpres.on('data', function (chunk) {
            postdata += chunk;
        });
        httpres.on('end', function () {
            console.log('postdata' + postdata);
            facebook_finish = 1;
            facebook_finish_info = postdata;
            callback3(facebook_finish_info);
            return 0;
        })
    });
    httpreq.write(data);
    httpreq.end();
}

function photosData(r_url, r_token, r_post_id, r_message) {
    data = querystring.stringify({
        url: this_url + r_url,
        access_token: r_token,
        posting_id: r_post_id,
        message: r_message
    });

    var options = {
        host: 'graph.facebook.com',
        port: 443,
        path: '/' + `${r_post_id}` + '/photos',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    var httpreq = https.request(options, function (httpres) {
        var postdata = '';
        httpres.setEncoding('utf8');
        httpres.on('data', function (chunk) {
            console.log("body: " + chunk);
            postdata += chunk;
        });
        httpres.on('end', function () {
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
function multiphotosData(r_url, r_token, r_post_id, r_message, callback) {
    console.log(r_url)
    data = querystring.stringify({
        message: r_message,
        url: this_url + r_url,
        published: 'false',
        posting_id: r_post_id,
        access_token: r_token
    })

    var options = {
        host: 'graph.facebook.com',
        port: 443,
        path: '/' + `${r_post_id}` + '/photos',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    var httpsreq = https.request(options, function (httpsres) {
        var postdata = '';
        httpsres.setEncoding('utf8');
        httpsres.on('data', function (chunk) {
            postdata += chunk;
        });
        httpsres.on('end', function () {
            console.log(postdata);
            callback(postdata)
        })
    });
    httpsreq.write(data);
    httpsreq.end();
}

//facebook에 실제로 올리는 function // 임시저장 게시물을 묶어서 보내는 형태
function postingMultiphotosData(r_message, r_post_id, r_token, idlist, callback4) {
    data = querystring.stringify({
        message: r_message,
        attached_media: idlist,
        posting_id: r_post_id,
        access_token: r_token
    })

    var options = {
        host: 'graph.facebook.com',
        port: 443,
        path: '/' + `${r_post_id}` + '/feed',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    var httpsreq = https.request(options, function (httpsres) {
        var postdata = '';
        httpsres.setEncoding('utf8');
        httpsres.on('data', function (chunk) {
            postdata += chunk;
        });
        httpsres.on('end', function () {
            callback4(postdata);
            //r_res.json(postdata);
            //return postdata;
        })
    });
    httpsreq.write(data);
    httpsreq.end();
}

function decodeimage(access_image, filename, callback1) {
    // var url_image = '/public/'+filename+'.jpg';
    var buf = Buffer.from(access_image, 'base64');
    fs.writeFile(path.join(__dirname, '/public/', filename + '.jpg'), buf, function (error) {
        if (error) {
            throw error;
        } else {
            callback1('/public/' + filename + '.jpg');
        }
    });
}

//facebook multi 관련 총괄 function
function posting_data_in_facebook(imagearray, r_message, r_posting_id, r_token, callback3) {
    postingidlist = [];
    count = Object.keys(imagearray).length;
    postingobject = []

    for (i = 0; i < count; i++) {

        async.waterfall([
            function (callback) { // image에 대하여 decode 과정이 필요
                var filename = r_posting_id + "_" + i;
                decodeimage(imagearray[i], filename, function (url_image) {
                    console.log('#url_image' + url_image);
                    callback(null, url_image)
                });
            },
            function (url_image, callback) {
                callback(null, url_image)
            },
            function (url_image, callback) {
                postingidlist = [];
                multiphotosData(url_image, r_token, r_posting_id, r_message, function (dres) {
                    console.log('chunk' + dres);
                    callback(null, dres);
                })
            },
            function (test, callback) {
                testc = JSON.parse(test);

                temp = { media_fbid: testc.id };
                postingobject.push(temp);
                if (postingobject.length == count) {
                    postingMultiphotosData(r_message, r_posting_id, r_token, JSON.stringify(postingobject), function (data) {
                        facebook_finish_info = data;
                        callback(null, facebook_finish_info)
                    });
                }
            }, function (facebook_finish_info, callback) {
                //facebook_posting

                facebook_finish = 1;
                callback3(facebook_finish_info);
            },function (err, result) {
            }
        ])
    }
}

function facebook_uploading(r_images, r_message, r_posting_id, r_token, facebook_finish, twitter_finish, facebook_finish_info, twitter_finish_info, is_twitter_posting, is_facebook_posting, callback2) {
    //console.log(r_images);
    console.log('#facebook_posting')
    imagecount = Object.keys(r_images).length;
    console.log('#imagecount' + imagecount);
    console.log('twitter_is ' + is_twitter_posting);
    /*if(count==1){ // 하나의 이미지에 대해서 전송하는 경우 
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
    else*/
    if (imagecount != 0) { // multi image 
        console.log('#posting multi image')
        posting_data_in_facebook(r_images, r_message, r_posting_id, r_token, function (data) {
            callback2(data);
        })  //정보를 통해서 사진 올리고 facebook 에 업로드 하는 함수
    }
    else { //image가 없는 경우
        console.log('#facebook_posting_message');
        async.waterfall([
            function (callback) {
                messageData(r_message, r_token, function (data) {
                    facebook_finish_info = data;
                    twitter_finish = 1;
                    if (is_facebook_posting & is_twitter_posting) {
                        console.log('#facebook_twitter_message_is in');
                        if (facebook_finish & twitter_finish) {
                            console.log('#facebook_twitter_message_done with f')
                            callback2(facebook_finish_info, twitter_finish_info);
                        }
                    } else {
                        console.log('#facebook message callback3');
                        console.log('facebook info : ' + facebook_finish_info);
                        callback2(facebook_finish_info);
                    }
                })
                callback(null, facebook_finish_info)
            },
            function (err, result) {
            }
        ])
    }

}

function saveImageToDisk(url, localPath) {
    var fullUrl = url;
    var file = fs.createWriteStream(localPath);
    var request = https.get(url, function (response) {
        response.pipe(file);
    });
}


//TWITTER POSTING//
//access_token이 받는 부분인것 같기도하고... //access token 부분은 후에 수정하기
CONSUMER_KEY = 'H3qNM38a3TzDXpWz6yY1hknFy'
CONSUMER_SECRET = 'GU4uxItEP3ZM926o1NcUP2gGbBoivm4cWge9dzxsvpJFLHLzRe'
ACCESS_TOKEN = '1093422729988960256-6qfauDfkxEZzhhE2ncDcLTpQrRQZth'
TOKEN_SECRET = 'Lnbqbk4To9HWb29F5nVGN5DBVVBjFha1lTJqn03nOOxgY'

function twitter_posting_i_m(r_status, r_images, facebook_finish, twitter_finish, facebook_finish_info, twitter_finish_info, is_twitter_posting, is_facebook_posting, tvn, cgv, callback2) {
    var client = new Twitter({
        consumer_key: CONSUMER_KEY,
        consumer_secret: CONSUMER_SECRET,
        access_token_key: cgv,
        access_token_secret: tvn
    });
    image_count = Object.keys(r_images).length;
    
    if (image_count == 0) { // image non
        console.log('#twitter_non image posting')
        client.post('statuses/update', { status: r_status }, function (error, tweet, response) {
            twitter_finish = 1
            if (error) {
                twitter_finish_info = error;

                callback2(twitter_finish_info)
                /*if(is_facebook_posting&is_twitter_posting){
                    console.log('twitter posting with facebook_m')
                    if(facebook_finish&twitter_finish){
                        console.log('finish_posting');
                        callback2(facebook_finish_info + twitter_finish_info);
                    }
                }else{
                    console.log('#twitter_info is done posting');
                    callback2(twitter_finish_info);
                }*/
            }
            else {
                twitter_finish_info = tweet;
                callback2(twitter_finish_info)
                /*
                if(is_facebook_posting&is_twitter_posting){
                    if(facebook_finish&twitter_finish){
                        callback2(facebook_finish_info+twitter_finish_info);
                    }
                }else{
                    callback2(twitter_finish_info);
                }*/
            };
            //console.log(tweet);
            //console.log(response);
        })
    } else { // multi_image
        console.log('#twitter_image posting')
        async.waterfall([
            function (callback) {
                //console.log(req.body.twitter)
                console.log('#twitter 사진 갯수입니다~'+r_images.length);
                posting_twitter(client, r_status, r_images, function (data) {
                    twitter_finish_info = data;
                    callback(null, twitter_finish_info)
                })
            },
            function (twitter_finish_info, result) {
                console.log('twitter_finish posting' + twitter_finish_info);
                callback2(twitter_finish_info);
                /*if(is_facebook_posting&is_twitter_posting){
                    if(facebook_finish&twitter_finish){
                        callback3(facebook_finish_info, twitter_finish_info);
                    }
                }else{
                    callback2(twitter_finish_info);
                }*/
                //res.json(err);
            }, function (err, result) {
                console.log(err);
            }
        ])
    }
}
function posting_twitter(client, r_message, r_images, callback2) {
    var image_ids_t = ''
    var j = 0;
    count = Object.keys(r_images).length;
    console.log(count);
    for (i = 0; i < count; i++) {
        (function (i, count, r_images, r_message, client) {
            client.post('media/upload', { media_data: r_images[i] }, function (error, media, response) {
                if (!error) {
                    async.waterfall([
                        function (callback) { // image에 대하여 decode 과정이 필요
                            console.log(i);
                            console.log(image_ids_t)
                            if (image_ids_t == '') {
                                image_ids_t += media.media_id_string;
                                j += 1;
                            }
                            else {
                                image_ids_t += (',' + media.media_id_string);
                                j += 1;
                            }
                            callback(null,image_ids_t,j);
                        },
                        function (image_ids_t,j, callback) {
                            console.log('hmm... 언제나오냥....' + i)
                            console.log('i' + i + 'count' + (count - 1));
                            console.log('statuses + ' + image_ids_t);
                            if (j == (count)) {
                                //post_data_t(image_ids_t,r_message);
                                var status = {
                                    status: r_message, //이거 변경하기
                                    media_ids: image_ids_t // Pass the media id string
                                }
                                console.log(image_ids_t);
                                console.log('update');
                                client.post('statuses/update', status, function (error, tweet, response) {
                                    if (!error) {
                                        console.log(tweet);
                                        callback2(tweet)
                                    } else {
                                        console.log(error);
                                        callback2(error)
                                    }
                                });
                            }
                        },function (err, result) {
                        }
                    ])

                }
            });
        })(i, count, r_images, r_message, client)
    }
}

app.listen(8090, () => console.log('Posting listening on port 8090'));
