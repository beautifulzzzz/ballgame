var express = require('express');
var bodyParser = require('body-parser');
var async = require('async');
var app = express();
var server = require('http').createServer(app);
var PORT = process.env.PORT || 8002;
server.listen(PORT);
console.log('Server running.');

//连接mysql
var mysql = require('mysql');
var db_config = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database:'ballgame',
    port: 3306
};
function handleDisconnect() {
  conn = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.
  conn.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  conn.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
  
  console.log("Connect Mysql Success");
}

handleDisconnect();


//设定路由
//使用body-parser解析body参数
app.use(bodyParser.urlencoded({  
    extended: true
}));

/***创建比赛，获取id */
app.post('/creategame', function (req, res) {
    res.contentType('json');//返回的数据类型
    console.log("creategame called");
    console.log(req.body);
    if(req.body.userid == undefined){
        res.send(JSON.stringify({error:"请传递userid"}));
        return;
    }
    var userid = req.body.userid;
    var createsql = 'INSERT INTO gameHistory (createTime) VALUES ('+ new Date().getTime()+')';
    //创建一个比赛
    conn.query(createsql, function (err, result) {
        if (err){
            console.log(err);
            res.send(JSON.stringify({error:"error"}));
            return;
        };
        var gameid = result.insertId;
        var sqlsArray = [
            'INSERT INTO gameUserSteps (gameid,userid,steps) VALUES ('+gameid+',"'+userid+'",0)',
            'INSERT INTO gameUserShot (gameid,userid,shotSum) VALUES ('+gameid+',"'+userid+'",0)',
        ];
        //初始化比赛数据
        async.mapLimit(sqlsArray,sqlsArray.length,
            function (sql, finishCallback) {
                conn.query(sql, function (err, result) {
                    if (err){
                        console.log(err);
                        finishCallback(err);
                        return;
                    };
                    finishCallback(null,sql);
                });
            },
            function (err, result) {
                if(err){
                    console.log("error is:"+err);
                    res.send(JSON.stringify({error:"error"}));
                    return;
                }
                res.send(JSON.stringify({error:null,gameid:gameid}));
            }
        );
    });
});

/** 设置运动员步数*/
app.post('/setusersteps', function (req, res) {
    res.contentType('json');//返回的数据类型
    console.log("setusersteps called");
    console.log(req.body);
    if(req.body.gameid == undefined || req.body.userid == undefined || req.body.steps == undefined){
        res.send(JSON.stringify({error:"请求参数不完整"}));
        return;
    }
    var gameid = req.body.gameid;
    var userid = req.body.userid;
    var steps = req.body.steps;
    var sql = 'UPDATE gameUserSteps SET steps = '+steps+' where gameid='+gameid+' AND userid="'+userid+'"';
    console.log(sql);
    //select
    conn.query(sql, function (err, result) {
        if (err){
            console.log(err);
            res.send(JSON.stringify({error:"error"}));
            return;
        };
        console.log(result);
        res.send(JSON.stringify({error:null}));
    });
});

/** 更新运动员投篮参数*/
app.post('/addusershot', function (req, res) {
    res.contentType('json');//返回的数据类型
    console.log("addusershot called");
    console.log(req.body);
    if(req.body.gameid == undefined || req.body.userid == undefined || req.body.shotIn == undefined){
        res.send(JSON.stringify({error:"请求参数不完整"}));
        return;
    }
    if(req.body.shotIn == 1 && (req.body.angle == undefined || req.body.distance == undefined)){
        res.send(JSON.stringify({error:"请求参数不完整"}));
        return;
    }
    var gameid = req.body.gameid;
    var userid = req.body.userid;
    var shotIn = req.body.shotIn;
    var angle = req.body.angle;
    var distance = req.body.distance;
	var shotTime = new Date().getTime();
    var sql;
    if(shotIn == 0){
        sql = 'INSERT gameUserShotDetail (gameid,userid,shotIn) VALUES ('+gameid+',"'+userid+'",0)';
    }else{
        sql = 'INSERT gameUserShotDetail (gameid,userid,shotIn,angle,distance,shotTime) VALUES ('+gameid+',"'+userid+'",1,'+angle+','+distance+','+shotTime+')';
    }
    console.log(sql);
    //select
    var sqlsArray = [
            sql,
            'UPDATE gameUserShot SET shotSum=shotSum+1 where gameid='+gameid+' AND userid="'+userid+'"'
        ];
    //同步更新个人投篮总记录
    async.mapLimit(sqlsArray,sqlsArray.length,
        function (sql, finishCallback) {
            conn.query(sql, function (err, result) {
                if (err){
                    console.log(err);
                    finishCallback(err);
                    return;
                };
                finishCallback(null,sql);
            });
        },
        function (err, result) {
            if(err){
                console.log("error is:"+err);
                res.send(JSON.stringify({error:"error"}));
                return;
            }
            res.send(JSON.stringify({error:null}));
        }
    );
});

/****************************查询接口 *****************************/
/** 查询最近场次的比赛*/
app.get('/recentgame', function (req, res) {
    res.contentType('json');//返回的数据类型
    console.log("recentgame called");
    var sql = 'SELECT * FROM gameHistory ORDER BY id DESC';
    console.log(sql);
    //select
    conn.query(sql, function (err, result) {
        if (err){
            console.log(err);
            res.send(JSON.stringify({error:"error"}));
            return;
        };
        if(result.length == 0){
            res.send(JSON.stringify({error:"no found data"}));
            return;
        }
        console.log(result[0]);
        var gameInfo = {
            error:null,
            gameid:result[0].id,
            createTime:result[0].createTime
        }
        res.send(JSON.stringify(gameInfo));
    });
});

/** 查询某用户在某个gameid*/
app.get('/userSteps', function (req, res) {
    res.contentType('json');//返回的数据类型
    console.log("userSteps called");
    if(req.query.gameid == undefined || req.query.userid == undefined){
        res.send(JSON.stringify({error:"请传递完整参数"}));
        return;
    }
    var gameid = req.query.gameid;
    var userid = req.query.userid;
    var sql = 'SELECT * FROM gameUserSteps WHERE gameid='+gameid+' AND userid="'+userid+'"';
    console.log(sql);
    //select
    conn.query(sql, function (err, result) {
        if (err){
            console.log(err);
            res.send(JSON.stringify({error:"error"}));
            return;
        };
        if(result.length == 0){
            res.send(JSON.stringify({error:"no found data"}));
            return;
        }
        var userStepsInfo = {
            error:null,
            gameid:result[0].gameid,
            userid:result[0].userid,
            steps:result[0].steps
        }
        res.send(JSON.stringify(userStepsInfo));
    });
});

/** 查询某用户某个比赛的投球情况*/
app.get('/userShotResults', function (req, res) {
    res.contentType('json');//返回的数据类型
    console.log("userShotResults called");
    if(req.query.gameid == undefined || req.query.userid == undefined){
        res.send(JSON.stringify({error:"请传递完整参数"}));
        return;
    }
    var gameid = req.query.gameid;
    var userid = req.query.userid;
	var shotIn = req.query.shotIn;

	var sql = 'select shotIn, COUNT(*) as NUM FROM gameUserShotDetail WHERE gameid='+gameid+' AND userid="'+userid+'" GROUP BY shotIn';

	console.log(sql);
	
    //select
    conn.query(sql, function (err, result) {
        if (err){
            console.log(err);
            res.send(JSON.stringify({error:"error"}));
            return;
        };
        if(result.length == 0){
            res.send(JSON.stringify({error:"no found data"}));
            return;
        }
		
		//console.log(result);
		//console.log(result.length);
		
		var userShotResults;
		
		if(result.length==2){
			userShotResults= {
				error:null,
				shotNum:(result[0].NUM + result[1].NUM),
				shotInNum:result[1].NUM,
			}
		}else if(result.length==1){
			userShotResults= {
				error:null,
				shotNum:result[0].NUM,
				shotInNum:result[0].shotIn == 0 ? 0:result[0].NUM,
			}
		}else{
			userShotResults= {
				error:null,
				shotNum:0,
				shotInNum:0,
			}
		}
		
        res.send(JSON.stringify(userShotResults));
    });
});

/** 查询某用户某比赛的投球细节*/
app.get('/userShotDetails', function (req, res) {
    res.contentType('json');//返回的数据类型
    console.log("userShotDetails called");
    if(req.query.gameid == undefined || req.query.userid == undefined){
        res.send(JSON.stringify({error:"请传递完整参数"}));
        return;
    }
    var gameid = req.query.gameid;
    var userid = req.query.userid;
    var sql = 'SELECT * FROM gameUserShotDetail WHERE gameid='+gameid+' AND userid="'+userid+'"';
    
	console.log(sql);
    //select
    conn.query(sql, function (err, result) {
        if (err){
            console.log(err);
            res.send(JSON.stringify({error:"error"}));
            return;
        };
        if(result.length == 0){
            res.send(JSON.stringify({error:"no found data"}));
            return;
        }
		
		var userShotDetails = {
            error:null,
            detail:result,
        }
		
        res.send(JSON.stringify(userShotDetails));
    });
});

var fs = require('fs'); 
/** 主页*/
app.get('/online', function (req, res) {
	fs.readFile('./shotBall/ball.html', 'utf-8',function (err, data) {//读取内容 
		if (err) throw err; 
		res.writeHead(200, { 
			"Content-Type": "text/html" 
		}); 
		res.write(data); 
		res.end(); 
	}); 
});
