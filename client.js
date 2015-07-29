var ws = require("nodejs-websocket");
var tessel = require('tessel');
var climatelib = require('climate-si7020');
var climate;
var ipAddress = "192.168.0.5";
var port = "8081";
var nickname = "tessel";

/**
 *
 */
function connectWebSocket() {

	// Set the binary fragmentation to 1 byte so it instantly sends anything we write to it
	ws.setBinaryFragmentation(1);

	var connection = ws.connect('ws://' + ipAddress + ':' + port, function() {
		console.log("Socket connected.");
		connection.sendText(nickname);

		connection.on("text", function(command) {
			if (command.indexOf('tessel') !== -1) {
				return;
			}

			switch(true) {
				case (command.indexOf('温度は？') !== -1):
					readTemperature(function(message) {
						connection.sendText(message);
					});
					break;
				case (command.indexOf('湿度は？') !== -1):
					readHumidity(function(message) {
						connection.sendText(message);
					});
					break;
				default:
						//
				}
			});
	});
}

function readTemperature(callback) {
	climate.readTemperature('c', function(err, temp) {
		var message;
		if (err) {
			message = err.message;
		} else {
			message = "現在のお部屋の温度は" + temp.toFixed(2) + "℃です。";
		}
		callback(message);
	});
}

function readHumidity(callback) {
	climate.readHumidity(function(err, humid) {
		var message;
		if (err) {
			message = err.message;
		} else {
			message = "現在のお部屋の湿度は" + humid.toFixed(2) + "%RHです。";
		}
		callback(message);
	});
}

function init() {
	climate = climatelib.use(tessel.port['A']);
	climate.on('ready', function () {
		console.log('Climate sensor is ready.');
		connectWebSocket();
	});
}


init();