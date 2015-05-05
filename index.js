var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/Dardos.html');
});


io.on('connection', function(socket){

  socket.on('new message', function(msg){
    socket.broadcast.emit('new message', msg);
    	var mensaje = msg;
    	var coordenadas = msg.split(",");
    	console.log("X: " + coordenadas[0]);
    	console.log("Y: " + coordenadas[1]);
      console.log("Coordenadas: "+ msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});