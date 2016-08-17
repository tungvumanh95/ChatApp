 var express = require('express');
 var app = express();
 var server = require('http').createServer(app);
 var io = require('socket.io').listen(server);
 var users = {};

 // for DB
 var mongoose = require('mongoose');

// mapping resource files
app.use(express.static('public'));

// mapping jquery file
app.get('/jquery/jquery.js', function(req, res) {
    res.sendfile(__dirname + '/node_modules/jquery/dist/jquery.min.js');
});

// starts server
 server.listen(3000);

// connect to DB
mongoose.connect('mongodb://localhost/chat', function(err) {
	if (err) {
		console.log(err);
	} else {
		console.log('Connect DB successfully');
	}
});

var chatSchema = mongoose.Schema({
	//name: {first: String, last: String},
	userName: String,
	msg: String,
	created: {type: Date, default: Date.now}
});

var Chat = mongoose.model('Message', chatSchema);

// maping index view file
 app.get('/chatapp', function(req, res) {
 	res.sendfile(__dirname + '/views/index.html');
 });

// listen connection
io.sockets.on('connection', function(socket){
	// select old chat from DB
	// Chat.find({}, function(err, docs) {
	// 	if (err) {
	// 		throw err;
	// 	}
	// 	socket.emit('load old message', docs);
	// });

 	var limits = 8;
 	var query = Chat.find({});
 	// query.sort('-created').limit....
 	query.sort({"created": -1}).limit(limits).exec(function(err, docs) {
		if (err) {
			throw err;
		}
		socket.emit('load old message', docs.reverse());
	});

	// listen to check exist userName or not
	socket.on('userLogin', function(data, callback) {
		// if user exists => sending false (invalid) to the client
		if (data in users) {
			callback(false);
		} else {
			callback(true);
			socket.userName = data;
			users[socket.userName] = socket;
			updateUserNames();
		}
	});

	// listen sending message event
	socket.on('sendMessageEvent', function(msg) {
		// save to DB
		var newMsg = new Chat({userName: socket.userName, msg: msg});
		newMsg.save(function(err){
			if (err) {
				throw err;
			}
			// send to all sockets
			io.sockets.emit('reciveMessageEvent', {userName: socket.userName, msg: msg});
			// I dont need this below code because it will send everyone except me
			// socket.broadcast.emit('reciveMessageEvent',data);
		});
	});

	socket.on('sendPrivateMessage', function(toUser, data) {
		users[toUser].emit('recivePrivateMessageEvent', {isSend: false, fromUserName: toUser, toUserName: socket.userName, msg: data});
		users[socket.userName].emit('recivePrivateMessageEvent', {isSend: true, fromUserName: socket.userName, toUserName: toUser, msg: data});
	});

	// listening disconnect event (Out the session)
	socket.on('disconnect', function(data){
		// Remove if user name is exist
		if(socket.userName) {
			console.log(socket.userName + ', ' +data);
			// users.splice(users.indexOf(socket.userName), 1);
			delete users[socket.userName];
			updateUserNames();
		}
	});

	// function update list usernames from an event
	function updateUserNames() {
		io.sockets.emit('users', Object.keys(users));
	}
});