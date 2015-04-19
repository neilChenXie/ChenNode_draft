fs = require("fs");
util = require('util');

var rv = {
	save:save
};

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

	/*return feedback*/
	res.send(rtnEntry);
}

exports.get = function() {
	return rv;
};
