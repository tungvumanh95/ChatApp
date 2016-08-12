 var express = require('express');
 var app = express();
 var server = require('http').createServer(app);
 var io = require('socket.io').listen(server);
 var lsUserNames = [];

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

// listen connection
io.sockets.on('connection', function(socket){

	// listen to check exist userName or not
	socket.on('userLogin', function(data, callback) {
		// if user exists => sending false (invalid) to the client
		if (lsUserNames.indexOf(data) != -1) {
			callback(false);
		} else {
			callback(true);
			socket.userName = data;
			lsUserNames.push(socket.userName);
			updateUserNames();
		}
	});

	// listen sending message event
	socket.on('sendMessageEvent', function(data){
		io.sockets.emit('reciveMessageEvent', {userName: socket.userName, msg: data});
		// I dont need this below code because it will send everyone except me
		// socket.broadcast.emit('reciveMessageEvent',data);
	});

	// listening disconnect event (Out the session)
	socket.on('disconnect', function(data){
		// Remove if user name is exist
		if(socket.userName) {
			console.log(socket.userName + ', ' +data);
			lsUserNames.splice(lsUserNames.indexOf(socket.userName), 1);
			updateUserNames();
		}
	});

	// function update list usernames from an event
	function updateUserNames() {
		io.sockets.emit('lsUserNames', lsUserNames);
	}
});