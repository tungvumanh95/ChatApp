 var express = require('express');
 var app = express();
 var server = require('http').createServer(app);
 var io = require('socket.io').listen(server);
 var users = {};

// mapping resource files
app.use(express.static('public'));

// mapping jquery file
app.get('/jquery/jquery.js', function(req, res) {
    res.sendfile(__dirname + '/node_modules/jquery/dist/jquery.min.js');
});

// starts server
 server.listen(3000);

// maping index view file
 app.get('/chatapp', function(req, res) {
 	res.sendfile(__dirname + '/views/index.html');
 });

// maping index view file
 app.get('/chatappBeauty', function(req, res) {
 	res.sendfile(__dirname + '/views/demo.html');
 });

// listen connection
io.sockets.on('connection', function(socket){

	// listen to check exist userName or not
	socket.on('userLogin', function(data, callback) {
		// if user exists => sending false (invalid) to the client
		if (data in users) {
			callback(false);
		} else {
			callback(true);
			socket.userName = data;
			users[socket.userName] = socket;
			var userNames = Object.keys(users);
			userNames.splice(userNames.indexOf(socket.userName), 1)
			socket.emit('init user names', userNames);
			updateUserNames('online');
		}
	});

	// listen sending message event
	socket.on('sendMessageEvent', function(data) {
		//io.sockets.emit('reciveMessageEvent', {userName: socket.userName, msg: data});
		// I dont need this below code because it will send everyone except me
		socket.broadcast.emit('reciveMessageEvent', {userName: socket.userName, msg: data});
	});

	socket.on('sendPrivateMessage', function(toUser, data) {
		users[toUser].emit('recivePrivateMessageEvent', {fromUserName: toUser, toUserName: socket.userName, msg: data});
		// users[socket.userName].emit('recivePrivateMessageEvent', {isSend: true, fromUserName: socket.userName, toUserName: toUser, msg: data});
	});

	// listening disconnect event (Out the session)
	socket.on('disconnect', function(data){
		// Remove if user name is exist
		if(socket.userName) {
			console.log(socket.userName + ', ' +data);
			// users.splice(users.indexOf(socket.userName), 1);
			updateUserNames('offline');
			delete users[socket.userName];
		}
	});

	// function update list usernames from an event
	function updateUserNames(stt) {
		var userNames = Object.keys(users);
		socket.broadcast.emit('update users', {status: stt, index: userNames.indexOf(socket.userName), userName: socket.userName});
	}
});