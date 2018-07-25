$(document).ready( initializeApplication);

function initializeApplication(){
	addEventHandlers();
	initializeSocket();
}
let ws = null;

function addEventHandlers(){
	$("#sendButton").click( handleMessageSend );
}

function handleMessageSend(){
	console.log('message send clicked');
	const message = $("#userMessage").text();
	sendMessageToServer(message);
	$("#userMessage").text('');
}

function createPacket( message, packetType='message'){
	const packet = {
		type: packetType,
		message: message
	}
	return JSON.stringify( packet );
}
/*
		<div class="messageContainer">
			<div class="sender">Dan</div>
			<div class="data">how does this work?</div>
		</div>
	*/
function addMessageToChat( sender, type, message){
	const messageContainer = $("<div>", {
		'class' : 'messageContainer ' + type
	});
	const senderDiv = $("<div>", {
		'class': 'sender',
		text: sender
	});
	const dataDiv = $("<div>",{
		'class': 'data',
		text: message
	});
	messageContainer.append(senderDiv, dataDiv);
	$("#messageDisplay").append( messageContainer );
}
function sendMessageToServer(message){
	
	ws.send( createPacket(message, 'message'));
}

function initializeSocket(){
	var username = prompt('what is your user name');
	if(!window.WebSocket){
		console.error('websocket is not available!');
		return false;
	}
	ws = new WebSocket("ws://10.2.78.204:5050");
	ws.onopen = ()=>{
		console.log('connected');
		ws.send( createPacket(username, 'config'));
	}
	ws.onclose = ()=>{
		console.log('disconnected');
	}
	ws.onmessage = event => {
		const data = JSON.parse(event.data);
		addMessageToChat( data.sender, data.type, data.message );
	}
}



















