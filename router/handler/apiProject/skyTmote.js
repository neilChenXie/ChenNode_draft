fs = require("fs");
util = require('util');

var rv = {
	save:save
};
/* global var*/
var Group = [];
var rssiEst = [];
var devi = [];
/* file stream */
var skyLog = fs.createWriteStream(__dirname+'/log/skyRSSI.txt', {flags: "w"});

/*reload console.info to write to skyLog file*/
console.info = function(d) {
	var msgHead = Date.now()+" ";
	skyLog.write(util.format(msgHead+d) + '\n');
};

/*save information function*/
function save(req, res) {
	res.status(200);
	var rtnEntry = '';
	var recEntry = '';

	/*get POST message body*/
	var msg = req.body;

	/* analyze req */
	if(msg) {

		/*check content of received msg*/
		var sucFlag = true;
		
		if(msg.bsID) {
			recEntry += msg.bsID+" ";
		} else {
			rtnEntry +="missing bsID;";
			sucFlag = false;
		}

		if(msg.bsLocX) {
			recEntry += msg.bsLocX+" ";
		} else {
			rtnEntry +="missing bsLocX;";
			sucFlag = false;
		}

		if(msg.bsLocY) {
			recEntry += msg.bsLocY+" ";
		} else {
			rtnEntry +="missing bsLocY;";
			sucFlag = false;
		}

		if(msg.bsLocZ) {
			recEntry += msg.bsLocZ+" ";
		} else {
			rtnEntry +="missing bsLocZ;";
			sucFlag = false;
		}

		if(msg.sensorID) {
			recEntry += msg.sensorID+" ";
		} else {
			rtnEntry +="missing sensorID;";
			sucFlag = false;
		}

		if(msg.sensorRSSI) {
			recEntry += msg.sensorRSSI+" ";
		} else {
			rtnEntry +="missing sensorRSSI;";
			sucFlag = false;
		}
		/*successfully get all message*/
		if(sucFlag) {
			rtnEntry = "Message received successfully";
		}
	} else {

		/*the msg is not received*/
		rtnEntry ="Message received with error";
	}

	/* record */
	if(recEntry) {
		console.info(recEntry);
		console.log(recEntry);
	} else {
		console.error(rtnEntry);
	}

	/*save to memory table*/
	var index = msg.bsID+"_"+msg.sensorID;
	console.log(index);
	calcu(index, parseInt(msg.sensorRSSI));

	/*return feedback*/
	res.send(rtnEntry);
}

function calcu(index, rssi) {
	/* check whether the Group is existed */
	if( typeof Group[index] == 'undefined') {
		Group[index] = [];
		devi[index] = 0;
		rssiEst[index] = 0;
	}
	/* * * * * * * * * * * * * * * * * * * */
	var len = Group[index].length;

	/* rssi window */
	if(len < 10) {
		Group[index].push(rssi);
	} else {
		Group[index].push(rssi);
		Group[index].shift();
	}
	console.log(Group[index]);
	
	/* new mean */
	if(len < 10)
		rssiEst[index] = rssiEst[index] * 0.2 + 0.8 * Group[index][len];
	else 
		rssiEst[index] = rssiEst[index] * 0.2 + 0.8 * Group[index][len-1];
	console.log(rssiEst[index]);

	/* new deviation */
	if( len == 10) {
		var squSum = 0;
		for(var i in Group[index]) {
			squSum += Math.pow((Group[index][i] - rssiEst[index]),2);
		}
		console.log(squSum);
		devi[index] = squSum / 10;
		console.log(devi[index]);
	}
}

exports.get = function() {
	return rv;
};
