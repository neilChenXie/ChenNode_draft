fs = require("fs");
util = require('util');

var rv = {
	save:save
};

/* file stream */
var skyLog = fs.createWriteStream(__dirname+'/log/skyRSSI.txt', {flags: "w"});

/*reload console.info to write to skyLog file*/
console.info = function(d) {
	var msgHead = Date.now()+" ";
	skyLog.write(util.format(msgHead+d) + '\n');
};

/* global var*/
var baseStation = [];		//hash table
var sensorList = [];	//hash table
var sensorCount = [];
var sensorTime = [];

/*save information function*/
function save(req, res) {
	console.log('--------------info--------------');
	res.status(200);

	/*get POST message body and Check*/
	var msg = req.body;
	var rv = checkMsg(msg); //return sucFlag, recEntry, rtnEntry

	/* record */
	if(rv.sucFlag) {
		console.info(rv.recEntry);
		console.log(rv.recEntry);
	} else {
		console.error(rv.rtnEntry);
		return;
	}

	/*save to memory table*/
	if( typeof baseStation[msg.bsID] == 'undefined' ) {
		baseStation[msg.bsID] = Object.create(null);
		baseStation[msg.bsID].X = parseFloat(msg.bsLocX);
		baseStation[msg.bsID].Y = parseFloat(msg.bsLocY);
		baseStation[msg.bsID].Z = parseFloat(msg.bsLocZ);
	}

	calcu(msg.sensorID, msg.bsID, parseInt(msg.sensorRSSI), parseInt(msg.timeStamp));

	/*return feedback*/
	res.send(rv.rtnEntry);
}

function calcu(sID, bID, rssi,timeStamp) {

	/* check whether the Group is existed */
	if( typeof sensorList[sID] == 'undefined'){
		sensorList[sID] = Object.create(null);
		sensorList[sID].bsList = [];
	}
	if(typeof sensorList[sID].bsList[bID] == 'undefined') {
		sensorList[sID].bsList[bID] = Object.create(null);
		sensorList[sID].bsList[bID].rssiAry = [];
		sensorList[sID].bsList[bID].rssiTime = [];
		sensorList[sID].bsList[bID].rssiEst = 0;
		sensorList[sID].bsList[bID].rssiDev = 0;
	}
	///* * * * * * * * * * * * * * * * * * * */
	
	//var len = Group[index].length;
	var len = sensorList[sID].bsList[bID].rssiAry.length;

	/* rssi window */
	if(len < 10) {
	//	Group[index].push(rssi);
		sensorList[sID].bsList[bID].rssiAry.push(rssi);
		sensorList[sID].bsList[bID].rssiTime.push(timeStamp);
	} else {
		sensorList[sID].bsList[bID].rssiAry.push(rssi);
		sensorList[sID].bsList[bID].rssiTime.push(timeStamp);
		sensorList[sID].bsList[bID].rssiAry.shift();
		sensorList[sID].bsList[bID].rssiTime.shift();
	}
	//console.log(Group[index]);
	console.log(sensorList[sID].bsList[bID].rssiAry);
	console.log(sensorList[sID].bsList[bID].rssiTime);

	/* new mean */
	if(len === 0) 
		sensorList[sID].bsList[bID].rssiEst = sensorList[sID].bsList[bID].rssiAry[len].toFixed(2);
	else if(len < 10 && len > 1)
		sensorList[sID].bsList[bID].rssiEst = (sensorList[sID].bsList[bID].rssiEst * 0.8 + 0.2 * sensorList[sID].bsList[bID].rssiAry[len]).toFixed(2);
	else 
		sensorList[sID].bsList[bID].rssiEst = (sensorList[sID].bsList[bID].rssiEst * 0.8 + 0.2 * sensorList[sID].bsList[bID].rssiAry[len-1]).toFixed(2);

	console.log(sensorList[sID].bsList[bID].rssiEst);

	/* new deviation */
	if( len == 10) {
		var squSum = 0;
		for(var i in sensorList[sID].bsList[bID].rssiAry) {
			squSum += Math.pow((sensorList[sID].bsList[bID].rssiAry[i] - sensorList[sID].bsList[bID].rssiEst),2);
		}
		sensorList[sID].bsList[bID].rssiDev = (squSum / 10).toFixed(2);
		console.log(sensorList[sID].bsList[bID].rssiDev);
	}

	/* decide whether need coordinate calculation */
	if( typeof sensorTime[sID] == 'undefined' ) {
		/* initial recorder */
		sensorTime[sID] = timeStamp;
		sensorCount[sID] = 1;
	} else if ( timeStamp > sensorTime[sID] ) {
		/* renew recorder */
		sensorTime[sID] = timeStamp;
		sensorCount[sID] = 1;
	} else if (timeStamp === sensorTime[sID]) {
		/* add recorder */
		sensorCount[sID]++;
		if(sensorCount[sID] === 3) {
			/* enough for this timeStamp */
			var tmpTime = sensorTime[sID];
			sensorTime[sID]++;
			sensorCount[sID] = 0;
			localize(sID,tmpTime);
		}
	} else {
		/* do nothing for overtime packet here */
	}
	console.log("new index:" + sensorTime[sID]);
	console.log("sensor counter:" + sensorCount[sID]);
	console.log('---------------------------------');
}

function localize(sID, timeStamp) {
	/* scan all baseStation */
	var recorder = [];
	var index = 0;
	for(var i in sensorList[sID].bsList) {
		if(sensorList[sID].bsList[i].rssiTime[9] >= timeStamp) {
			/* need record */
			recorder[index].bsID = i;
			recorder[index].rssi = sensorList[sID].bsList[i].rssiEst;
			index++;
			if(index === 3)
				break;
		}
	}
	/* localization */
	/*xyz123*/
	x1 = baseStation[recorder[0].bsID].X;
	x2 = baseStation[recorder[1].bsID].X;
	x3 = baseStation[recorder[2].bsID].X;
	y1 = baseStation[recorder[0].bsID].Y;
	y2 = baseStation[recorder[1].bsID].Y;
	y3 = baseStation[recorder[2].bsID].Y;
	z1 = baseStation[recorder[0].bsID].Z;
	z2 = baseStation[recorder[1].bsID].Z;
	z3 = baseStation[recorder[2].bsID].Z;
	b1p1 = (pow(x1,2) - pow(x3,2)) / ( 2 * (y1 - y3) );
	b2p1 = (pow(x2,2) - pow(x3,2)) / ( 2 * (y2 - y3) );
	k1 = (x3 - x1) / (y1 - y3);
	k2 = (x3 - x1) / (y2 - y3);
	/*d1,d2,d3*/
	rssi1 = recorder[0].rssi;
	rssi2 = recorder[1].rssi;
	rssi3 = recorder[2].rssi;
	/*calcu*/
	var dValue31 = pow(d3,2) - pow(d1,2);
	var dValue32 = pow(d3,2) - pow(d2,2);
	var b1p2 = dValue31 / ( 2 * (y1 - y3) );
	var b2p2 = dValue32 / ( 2 * (y2 - y3) );
	var b1 = b1p1 + b1p2;
	var b2 = b2p1 + b2p2;
	x = ( b2 - b1 ) / ( k1 - k2 );
	y = ( b2 * k1 - b1 * k2 ) / ( k1 - k2 );
}

function checkMsg(msg) {
	/* analyze req */
	var rtnEntry = '';
	var recEntry = '';
	var sucFlag = true;
	if(msg) {
		/*check content of received msg*/
		if(msg.sensorID) {
			recEntry += msg.sensorID+" ";
		} else {
			rtnEntry +="missing sensorID;";
			sucFlag = false;
		}

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
	var tmp = Object.create(null);
	tmp.sucFlag = sucFlag;
	tmp.recEntry = recEntry;
	tmp.rtnEntry = rtnEntry;
	return tmp;
}
exports.get = function() {
	return rv;
};
