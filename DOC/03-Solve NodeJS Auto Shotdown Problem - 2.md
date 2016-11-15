#### Problem 1
When I run `nohup node index.js &` appear the error:    

> -bash: /usr/bin/nohup: Permission denied    

Permission Problem, so set the /usr/bin/nohup  755

#### Problem 2

Even Though I used the `nohup` command to solve the problem of nodejs application is closed, The application will auto be kill when it run a little time.

When I see the nohup log find that:

    Error: Connection lost: The server closed the connection.   
    at Protocol.end (/home/ballgame/node_modules/mysql/lib/protocol/Protocol.js:109:13)   
    at Socket.<anonymous> (/home/ballgame/node_modules/mysql/lib/Connection.js:115:28)				
    at Socket.emit (events.js:117:20)			
    at _stream_readable.js:944:16			
    at process._tickCallback (node.js:448:13)

**How to do** : [http://stackoverflow.com/questions/20210522/nodejs-mysql-error-connection-lost-the-server-closed-the-connection][#1]

I flow `how to do` change the part of mysql-connectting: 

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
      conn.connect(function(err) {  // The server is either down
    if(err) { // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    } // to avoid a hot loop, and to allow our node script to
      }); // process asynchronous requests in the meantime.
      // If you're also serving http, display a 503 error.
      conn.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect(); // lost due to either server restart, or a
    } else {  // connnection idle timeout (the wait_timeout
      throw err;  // server variable configures this)
    }
      });
      
      console.log("Connect Mysql Success");
    }
    
    handleDisconnect();



[#1]:http://stackoverflow.com/questions/20210522/nodejs-mysql-error-connection-lost-the-server-closed-the-connection
