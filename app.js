 var express = require('express');
 var app = express();
 var server = require('http').createServer(app);
 var io = require('socket.io').listen(server);

app.use(express.static('public'));
app.get('/jquery/jquery.js', function(req, res) {
    res.sendfile(__dirname + '/node_modules/jquery/dist/jquery.min.js');
});

 server.listen(3000);

 app.get('/chatapp', function(req, res) {
 	res.sendfile(__dirname + '/views/index.html');
 });

io.sockets.on('connection', function(socket){
	socket.on('sendMessageEvent', function(data){
		io.sockets.emit('reciveMessageEvent', data);
		// I dont need this below code because it will send everyone except me
		// socket.broadcast.emit('reciveMessageEvent',data);
	});
});