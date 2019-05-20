var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var port = 3000;
server.listen (port, function() {
  console.log ('listening on port ' + port)
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/race.html');
});

///////////////////////////////////////
// global variables
// nID: for ID of connecting client
// status: array of status objects {id, turning}
//
var nID = 0;
var status = [];

io.on('connect', function(socket){

  //////////////////////////////////////////////////////////  
  // things to do when a client connects
  console.log ('a user connected with socket ');
  
  // assign and return the ID to the new client
  console.log ('client ' + nID + ' login ...')
  socket.emit ('id_set', nID);
  
  status.push ({id: nID, step: false,ready: false, finish: false});
  console.log (status);
  io.emit ('update_status', status)
  
  // this must be the LAST thing to do
  ++nID;
  
  //////////////////////////////////////////////////////////  
  socket.on('accelerator', function(statusStr) {
	let msg = JSON.parse (statusStr);
	
  	// find myID in status
  	let i;
  	for (i = 0; i < status.length; i++) {
  	  if (status[i].id === msg.id) break;
  	}
 	status[i].step = msg.step;
 	 	
 	console.log (status);
	console.log (" ");
  	io.emit ('update_status', status);
  });
  socket.on('readyCheck', function(statusStr) {
	let msg = JSON.parse (statusStr);
  	let i, check;
  	for (i = 0; i < status.length; i++) {
  	  if (status[i].id === msg.id){
		  status[i].ready = msg.ready;
		  break;
	  }
  	}
	
	for (i = 0,check =0; i < status.length; i++) {
  	  if (status[i].ready ) check++;
  	}
	
 	if(check == status.length)
		io.emit ('countDown', 6);
 	console.log (status);
	io.emit ('update_status', status);
  });
  
  socket.on('gameover', function(statusStr) {
	  let msg = JSON.parse (statusStr);
	  //console.log (msg);
	  for (i = 0,check =0; i < status.length; i++) {
  	  if (status[i].id === msg.id){
		  status[i].finish = msg.finish;
		  break;
	  }
	  socket.broadcast.emit ('update_status', status);
  	}
  });
  
  socket.on ('angle_now', function (data) {
	let angle = data.angle;
	console.log ('from client: ' + data.id + ':' + angle);
	socket.broadcast.emit ('angle_now', data);
  });
});

