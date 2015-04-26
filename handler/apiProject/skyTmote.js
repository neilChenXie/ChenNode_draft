config = require("../../config").config();
fs = require("fs");
util = require("util");
/* database */
var myDB = require(config.skyTmote.model_base + "db");


/* skyTmote log system */
var skyLog = fs.createWriteStream(config.skyTmote.log_base + 'skyRSSI.txt', {flags: "w"});

/*reload console.skyTmote to write to skyLog file*/
console.skyTmote = function(d) {
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

	/* start database */
	myDB.start();

	console.cDebug('--------------info--------------');
	res.status(200);

	/*get POST message body and Check*/
	var msg = req.body;
	var rv = checkMsg(msg); //return sucFlag, recEntry, rtnEntry

	/* record */
	if(rv.sucFlag) {
		console.skyTmote(rv.recEntry);
		console.cDebug(rv.recEntry);
	} else {
		console.cError(rv.rtnEntry);
		return;
	}

	/*save to memory table*/
	if( typeof baseStation[msg.bsID] == 'undefined' ) {
		baseStation[msg.bsID] = Object.create(null);
		baseStation[msg.bsID].bsID = msg.bsID;
		baseStation[msg.bsID].X = parseFloat(msg.bsLocX);
		baseStation[msg.bsID].Y = parseFloat(msg.bsLocY);
		baseStation[msg.bsID].Z = parseFloat(msg.bsLocZ);
		console.log(baseStation[msg.bsID].X);

		/* write new base station info into data base */
		myDB.addBS(baseStation[msg.bsID]);
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
	//console.cDebug(Group[index]);
	console.cDebug(sensorList[sID].bsList[bID].rssiAry);
	console.cDebug(sensorList[sID].bsList[bID].rssiTime);

	/* new mean */
	if(len === 0) 
		sensorList[sID].bsList[bID].rssiEst = sensorList[sID].bsList[bID].rssiAry[len].toFixed(2);
	else if(len < 10 && len > 1)
		sensorList[sID].bsList[bID].rssiEst = (sensorList[sID].bsList[bID].rssiEst * 0.8 + 0.2 * sensorList[sID].bsList[bID].rssiAry[len]).toFixed(2);
	else 
		sensorList[sID].bsList[bID].rssiEst = (sensorList[sID].bsList[bID].rssiEst * 0.8 + 0.2 * sensorList[sID].bsList[bID].rssiAry[len-1]).toFixed(2);

	console.cDebug(sensorList[sID].bsList[bID].rssiEst);

	/* new deviation */
	if( len == 10) {
		var squSum = 0;
		for(var i in sensorList[sID].bsList[bID].rssiAry) {
			squSum += Math.pow((sensorList[sID].bsList[bID].rssiAry[i] - sensorList[sID].bsList[bID].rssiEst),2);
		}
		sensorList[sID].bsList[bID].rssiDev = (squSum / 10).toFixed(2);
		console.cDebug(sensorList[sID].bsList[bID].rssiDev);
	}

	/* decide whether need coordinate calculation */
	if( len == 10) {
		/* whatif the sender restarted??? */
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
	}
	console.cDebug("new index:" + sensorTime[sID]);
	console.cDebug("sensor counter:" + sensorCount[sID]);
	console.cDebug('---------------------------------');
}

function localize(sID, timeStamp) {
	/* scan all baseStation */
	var recorder = [];
	recorder[0] = Object.create(null);
	recorder[1] = Object.create(null);
	recorder[2] = Object.create(null);
	var index = 0;
	for(var i in sensorList[sID].bsList) {
		//console.cDebug(i);
		//console.cDebug("time stamp: "+timeStamp);
		//console.cDebug("sensor last: "+sensorList[sID].bsList[i].rssiTime[9]);
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
	//console.cDebug("x_1: "+x1);
	//console.cDebug("x_2: "+x2);
	//console.cDebug("x_3: "+x3);
	//console.cDebug("y_1: "+y1);
	//console.cDebug("y_2: "+y2);
	//console.cDebug("y_3: "+y3);
	b1p1 = (Math.pow(x3,2) - Math.pow(x1,2) + Math.pow(y3,2) - Math.pow(y1,2)) / ( 2 * (y3 - y1) );
	b2p1 = (Math.pow(x3,2) - Math.pow(x2,2) + Math.pow(y3,2) - Math.pow(y2,2)) / ( 2 * (y3 - y2) );
	//console.cDebug("b1p1: "+b1p1);
	//console.cDebug("b2p1: "+b2p1);
	k1 = (x1 - x3) / (y3 - y1);
	k2 = (x2 - x3) / (y3 - y2);
	//console.cDebug("k1: "+k1);
	//console.cDebug("k2: "+k2);
	/*d1,d2,d3*/
	rssi1 = recorder[0].rssi;
	rssi2 = recorder[1].rssi;
	rssi3 = recorder[2].rssi;
	console.cDebug("rssi1: "+recorder[0].rssi);
	console.cDebug("rssi2: "+recorder[1].rssi);
	console.cDebug("rssi3: "+recorder[2].rssi);
	d3 = 1;
	d2 = 1;
	d1 = 1.414;
	/*calcu*/
	var dValue31 = Math.pow(d1,2) - Math.pow(d3,2);
	var dValue32 = Math.pow(d2,2) - Math.pow(d3,2);
	var b1p2 = dValue31 / ( 2 * (y3 - y1) );
	var b2p2 = dValue32 / ( 2 * (y3 - y2) );
	//console.cDebug("b1p2: "+b1p2);
	//console.cDebug("b2p2: "+b2p2);
	var b1 = b1p1 + b1p2;
	var b2 = b2p1 + b2p2;
	x = (( b2 - b1 ) / ( k1 - k2 )).toFixed(4);
	y = (( b2 * k1 - b1 * k2 ) / ( k1 - k2 )).toFixed(4);
	console.cDebug("sensor_X: "+x.toString());
	console.cDebug("sensor_Y: "+y.toString());
	console.cDebug(y);
	var storeObj = {
		sID:sID,
		timeStamp:timeStamp,
		X:x,
		Y:y
	};
	myDB.addLoc(storeObj);
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


/* return var */
var rv = {
	save:save
};

exports.get = function() {
	return rv;
};
