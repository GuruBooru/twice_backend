const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3366;
var mysql = require('mysql');
var fs = require('fs');

const path = require('path');
const router = express.Router();
/*
var connection = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password : '1234',
	database : 'twice'
});*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
/*
app.post('/user-insert',(req,res)=> {
	console.log('user-insert');
	var data =req.body;
	console.log(data.id);
	console.log('connect: '  + req.body.id);
	var q = 'INSERT INTO USER (userID, password) VALUES = ?';
	connection.query(q,[req.body.id,req.body.pass],(err, rows, field)=>{
		if(err) throw err;
		else
			res.json('success');
	})
})*/

app.get('/facebook',(req,res)=> {
        console.log('user-insert');
        var s = ("twice는 서비스제공을 위해 facebook으로부터 아래와 같은 권한을 필요로 합니다.\r\n\t\t- 사용자의 id 및 프로필 정보(이름,email등)\r\n\t\t- 어플리케이션을 이용하기 위한 사용자 토큰\r\n\t\t- 기타 어플리케이션을 이용하기 위한 정보\r\n\n\n facebook에서 수집한 정보를 사용하여 Twice는 다음과 같은 기능을 제공해드립니다.\r\n\t\t- facebook 글 쓰기, 조회, 삭제 및 수정 기능\r\n\t\t- 댓글 작성, 삭제 및 수정 기능\r\n\t\t- 사용자의 타임라인을 종합한 통합 게시글 기능\r\n\t\t- 예약게시글 작성 기능\r\n\r\n\r\n 귀하의 개인정보는 원칙적으로 개인정보 수집 및 이용목적이 달성이 되면 지체없이 파기합니다.\r\n\r\n\r\n 동의를 거부하실수 있으나, 위의 기능은 facebook과 관련된 기능을 제공하는데 필수적인 기능이므로, 동의를 거부할 시에 해당기능을 사용하지 못하실 수 있습니다.\r\n\r\n동의 하신다면 아래의 버튼의 동의를 눌러주세요");
        res.send(s);
})

app.get('/twitter',(req,res)=> {
        console.log('user-insert');
        var s = "twice는 서비스제공을 위해 twitter으로부터 아래와 같은 권한을 필요로 합니다.\n\t\t- 사용자의 id 및 프로필 정보(이름,email등)\n\t\t- 어플리케이션을 이용하기 위한 사용자 토큰\n\t\t- 기타 어플리케이션을 이용하기 위한 정보\n\n\n twitter에서 수집한 정보를 사용하여 Twice는 다음과 같은 기능을 제공해드립니다.\n\t\t- twitter 글 쓰기, 조회, 삭제 및 수정 기능\n\t\t- 댓글 작성, 삭제 및 수정 기능\n\t\t- 사용자의 타임라인을 종합한 통합 게시글 기능\n\t\t- 예약게시글 작성 기능\n\n\n 귀하의 개인정보는 원칙적으로 개인정보 수집 및 이용목적이 달성이 되면 지체없이 파기합니다.\n\n\n 동의를 거부하실수 있으나, 위의 기능은 twitter과 관련된 기능을 제공하는데 필수적인 기능이므로, 동의를 거부할 시에 해당기능을 사용하지 못하실 수 있습니다.\n\n동의 하신다면 아래의 버튼의 동의를 눌러주세요";
        res.send(s);
})
app.get('/instagram',(req,res)=> {
        console.log('user-insert');
        var s = "twice는 서비스제공을 위해 instagram으로부터 아래와 같은 권한을 필요로 합니다.\n\t\t- 사용자의 id 및 프로필 정보(이름,email등)\n\t\t- 어플리케이션을 이용하기 위한 사용자 토큰\n\t\t- 기타 어플리케이션을 이용하기 위한 정보\n\n\n instagram에서 수집한 정보를 사용하여 Twice는 다음과 같은 기능을 제공해드립니다.\n\t\t- instagram 글 쓰기, 조회, 삭제 및 수정 기능\n\t\t- 댓글 작성, 삭제 및 수정 기능\n\t\t- 사용자의 타임라인을 종합한 통합 게시글 기능\n\t\t- 예약게시글 작성 기능\n\n\n 귀하의 개인정보는 원칙적으로 개인정보 수집 및 이용목적이 달성이 되면 지체없이 파기합니다.\n\n\n 동의를 거부하실수 있으나, 위의 기능은 instagram과 관련된 기능을 제공하는데 필수적인 기능이므로, 동의를 거부할 시에 해당기능을 사용하지 못하실 수 있습니다.\n\n동의 하신다면 아래의 버튼의 동의를 눌러주세요";
        res.send(s);
})

app.get('/instagram_page',(req,res)=> {
	console.log('html page');
	res.sendFile(path.join(__dirname+'/test.html'));
})

app.get('/instagram_login_code',(req,res)=>{
	console.log('return code');
 	var s = req.query.code;
	res.send(s);
})
app.get('/instagram_login_token',(req,res)=>{
	console.log('return token');
 	var s = req.query.access_token;
	res.send(s);
})

app.get('/video', function(req, res) {
	const path = './instavideo.mp4'
	const stat = fs.statSync(path)
	const fileSize = stat.size
	const range = req.headers.range
	if (range) {
	  const parts = range.replace(/bytes=/, "").split("-")
	  const start = parseInt(parts[0], 10)
	  const end = parts[1] 
	    ? parseInt(parts[1], 10)
	    : fileSize-1
	  const chunksize = (end-start)+1
	  const file = fs.createReadStream(path, {start, end})
	  const head = {
	    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
	    'Accept-Ranges': 'bytes',
	    'Content-Length': chunksize,
	    'Content-Type': 'video/mp4',
	  }
	  res.writeHead(206, head);
	  file.pipe(res);
	} else {
	  const head = {
	    'Content-Length': fileSize,
	    'Content-Type': 'video/mp4',
	  }
	  res.writeHead(200, head)
	  fs.createReadStream(path).pipe(res)
	}
			});
			


app.listen(port, () => console.log('listen'))
