
const WebSocketServer = require('websocket').server;
const http = require('http');

const server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(5050, function() {
    console.log((new Date()) + 'Server is listening on port 5050');
});
const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

const connectedUsers = {};

const messageHandlers = {
	config: (data, connection)=>{
		if(connectedUsers[data]===undefined){
			connectedUsers[data] = {
				username: data,
				conn: connection
			}
			connection.sendUTF(createPacket(data, "connection accepted, welcome "+data, 'join'));
			console.log(connectedUsers)
			sendMessageFromUser(data, data + ' has joined', "join");
			return;
		}
		connection.sendUTF(createPacket(data, data + " is already used, please pick another name", 'join'));
		connection.close();
		return;
	},
	message: (message, connection)=>{
		//packet = JSON.parse(packet);
		const user = findUserFromConnection(connection);
		sendMessageFromUser(user, message, "message", true);
	}
}
function createPacket( sender, message, packetType='message'){
	const packet = {
		sender: sender,
		type: packetType,
		message: message
	}
	return JSON.stringify( packet );
}

function findUserFromConnection( connection ){
	for( var user in connectedUsers){
		if( connection === connectedUsers[user].conn){		
			return user
		}
	}
	return false;
}

function sendMessageFromUser( originalUser, message, type, sendToSender=false){
	var outboundPacket = createPacket( originalUser, message, type);
	for( var user in connectedUsers){
		if(sendToSender || user !== originalUser){
			connectedUsers[user].conn.sendUTF( outboundPacket );
		} else {
			console.log('not sending message to original sender')
		}
	}
}

wsServer.on('request', request=>{
	console.log((new Date()) + ' Connection accepted.');
	const connection = request.accept();
	connection.on('message', message=>{
		console.log('received a message');
		console.log( message.utf8Data);
		var packet = JSON.parse(message.utf8Data);
		messageHandlers[ packet.type ]( packet.message, connection );
	})
	connection.on('close', (reason, description)=>{
		const user = findUserFromConnection( connection);
		sendMessageFromUser(user, user + " has disconnected", 'join');
		delete connectedUsers[user];
	})
});



















