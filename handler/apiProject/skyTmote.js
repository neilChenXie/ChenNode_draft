config = require("../../config").config();
fs = require("fs");
util = require("util");
/* database */
var myDB = require(config.skyTmote.model_base + "db");

/* localization log */
var locLog =  fs.createWriteStream('/home/chen/Documents/output.csv', {flags: "w"});

/* skyTmote log system */
var skyLog = fs.createWriteStream(config.skyTmote.log_base + 'skyRSSIdev.txt', {flags: "w"});
var skyLog2 = fs.createWriteStream(config.skyTmote.log_base + 'skyRSSIstay.txt', {flags: "w"});
var stayLog = fs.createWriteStream(config.skyTmote.log_base + 'stay1.txt', {flags: "w"});
var stayLog2 = fs.createWriteStream(config.skyTmote.log_base + 'stay2.txt', {flags: "w"});
var stayLog3 = fs.createWriteStream(config.skyTmote.log_base + 'stay3.txt', {flags: "w"});
var DevLog = fs.createWriteStream(config.skyTmote.log_base + 'dev1.txt', {flags: "w"});
var DevLog2 = fs.createWriteStream(config.skyTmote.log_base + 'dev2.txt', {flags: "w"});
var DevLog3 = fs.createWriteStream(config.skyTmote.log_base + 'dev3.txt', {flags: "w"});

/*reload console.skyTmote to write to skyLog file*/
console.arrPkt = function(d) {
	locLog.write(util.format(d) + '\n');
};
console.skyTmote = function(d) {
	var msgHead = Date.now()+" ";
	skyLog.write(util.format(msgHead+d) + '\n');
};
console.skyTmote2 = function(d) {
	var msgHead = Date.now()+" ";
	skyLog2.write(util.format(msgHead+d) + '\n');
};
console.stayLog = function(d) {
	stayLog.write(util.format(d) + '\n');
};
console.stayLog2 = function(d) {
	stayLog2.write(util.format(d) + '\n');
};
console.stayLog3 = function(d) {
	stayLog3.write(util.format(d) + '\n');
};
console.devLog = function(d) {
	DevLog.write(util.format(d) + '\n');
};
console.devLog2 = function(d) {
	DevLog2.write(util.format(d) + '\n');
};
console.devLog3 = function(d) {
	DevLog3.write(util.format(d) + '\n');
};



/* global var*/
var baseStation = [];		//hash table
var sensorList = [];		//hash table
/* for movement check*/
var movTmpList = [];
/* for localizaiton algorithm */
var bsTmpList = [];
var rssiTmpList = [];
/* for DataBase server */
var powerVector = [];




/* save information function */
function save(req, res) {

	/* start database */
	myDB.start();

	console.cDebug('--------------info--------------');
	res.status(200).send('OK');

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
	//res.send(rv.rtnEntry);
}

function calcu(sID, bID, rssi,timeStamp) {

	//console.log(Date.now()+',D,'+bID+','+sID/10+','+rssi);
	//var tmpBS = parseInt(bID) + 1;
	//var tmpTi = parseInt(Date.now() / 1000);
	//console.arrPkt(tmpTi+', D,'+tmpBS.toString()+'.0,'+sID/10+'.0,'+rssi);
	/* check whether the Group is existed */
	if( typeof sensorList[sID] == 'undefined'){
		sensorList[sID] = Object.create(null);
		sensorList[sID].bsList = [];
		sensorList[sID].bsRec = [];
		sensorList[sID].bsRec.push(bID);
		sensorList[sID].timeRec = timeStamp;
	}
	if(typeof sensorList[sID].bsList[bID] == 'undefined') {
		sensorList[sID].bsList[bID] = Object.create(null);
		sensorList[sID].bsList[bID].rssiAry = [];
		sensorList[sID].bsList[bID].rssiTime = [];
		sensorList[sID].bsList[bID].rssiEst = 0;
		sensorList[sID].bsList[bID].rssiDev = 0;
		sensorList[sID].bsList[bID].stayChe = 0;
	}
	/* * * * * * * * * * * * * * * * * * * */
	//if(timeStamp >=  sensorList[sID].timeRec) {

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

		console.cDebug("Est: "+sensorList[sID].bsList[bID].rssiEst);

		/* new deviation */
		if( len == 10) {
			var squSum = 0;
			for(var i in sensorList[sID].bsList[bID].rssiAry) {
				squSum += Math.pow((sensorList[sID].bsList[bID].rssiAry[i] - sensorList[sID].bsList[bID].rssiEst),2);
			}
			sensorList[sID].bsList[bID].rssiDev = (squSum / 10).toFixed(2);
			console.cDebug("Dev: "+sensorList[sID].bsList[bID].rssiDev);
		}
		/* stable check */
		if(len > 3) {
			var indTail = len - 1;
			var squSumChe = 0;
			var tmpI;
			for(tmpI = indTail - 3; tmpI < indTail; tmpI++) {
				//console.log(sensorList[sID].bsList[bID].rssiAry[tmpI]);
				squSumChe += Math.pow((sensorList[sID].bsList[bID].rssiAry[tmpI] - sensorList[sID].bsList[bID].rssiEst),2);
			}
			sensorList[sID].bsList[bID].stayChe = (squSumChe / 3).toFixed(2);
			console.cDebug("Stay: "+sensorList[sID].bsList[bID].stayChe);
		}

		/* decide whether need coordinate calculation */
		if( len == 10) {
			/* whatif the sender restarted??? */
			if(timeStamp > sensorList[sID].timeRec) {
				/* renew recorder */
				sensorList[sID].timeRec = timeStamp;
				sensorList[sID].bsRec = [];
				sensorList[sID].bsRec.push(bID);
			} else if(timeStamp === sensorList[sID].timeRec) {
				/* add recorder */
				sensorList[sID].bsRec.push(bID);
				if(sensorList[sID].bsRec.length == 4) {
					/* enough for this timeStamp */
					var tmpTime = sensorList[sID].timeRec;
					sensorList[sID].timeRec++;
					bsTmpList[sID] = [];
					bsTmpList[sID] = sensorList[sID].bsRec.slice();
					sensorList[sID].bsRec = [];
					/* algorithm call */
					//console.log(bsTmpList[sID]);
					storeVal(sID,bsTmpList[sID]);
					movement(sID,bsTmpList[sID],timeStamp);
					sendToServer(sID);
					//localize(sID,bsTmpList[sID],tmpTime);
				}
			} else {
				/* do nothing for overtime packet here */
			}
		}

		//console.log(sensorList[sID].bsRec);
		//console.log(sensorList[sID].timeRec);
		//console.cDebug("new index:" + sensorTime[sID]);
		//console.cDebug("sensor counter:" + sensorCount[sID]);
		console.cDebug('---------------------------------');

	//}/* end of timeStamp check */
}

function sendToServer(sID) {
	console.log('_______sending_________');
	console.log(sID);
	console.log(powerVector[sID]);
	console.log(movTmpList[sID].mvFlag);
	console.log('_______________________');
}

function storeVal(sID, bsTmpListStore)
{
	powerVector[sID] = [];
	if(typeof movTmpList[sID] == "undefined") {
		movTmpList[sID] = Object.create(null);
		movTmpList[sID].Dev = [];
		movTmpList[sID].stable = [];
		movTmpList[sID].recDev = [];
		movTmpList[sID].recStable = [];
		movTmpList[sID].mvFlag = false;
		movTmpList[sID].stable.push(0);
		movTmpList[sID].stable.push(0);
		movTmpList[sID].stable.push(0);
	}
	bsTmpListStore = bsTmpListStore.sort();
	var tmpI;
	var myTime = parseInt(Date.now() / 1000);
	for(tmpI in bsTmpListStore) {
		/* store var list */
		movTmpList[sID].Dev[tmpI] = sensorList[sID].bsList[bsTmpListStore[tmpI]].rssiDev;
		movTmpList[sID].stable[tmpI] = 0.2 * sensorList[sID].bsList[bsTmpListStore[tmpI]].stayChe + 0.8 * movTmpList[sID].stable[tmpI];
		powerVector[sID][tmpI] = sensorList[sID].bsList[bsTmpListStore[tmpI]].rssiEst;
		var tmpBS = parseInt(bsTmpListStore[tmpI]) + 1;
		console.arrPkt(myTime+', D,'+tmpBS.toString()+'.0,'+sID/10+'.0,'+parseInt(powerVector[sID][tmpI]));
	}
	movTmpList[sID].recDev.push(movTmpList[sID].Dev.slice());
	movTmpList[sID].recStable.push(movTmpList[sID].stable.slice());
}

function movement(sID, bsTmpListMov,timeStamp) {
	//console.log(movTmpList[sID].Dev);
	//console.log(movTmpList[sID].stable);
	//console.log(movTmpList[sID].recDev);
	//console.log(movTmpList[sID].recStable);
	//console.skyTmote(movTmpList[sID].Dev);
	//console.skyTmote2(movTmpList[sID].stable);
	//console.devLog(movTmpList[sID].Dev[0]);
	//console.devLog2(movTmpList[sID].Dev[1]);
	//console.devLog3(movTmpList[sID].Dev[2]);
	console.stayLog(movTmpList[sID].stable[0]);
	console.stayLog2(movTmpList[sID].stable[1]);
	console.stayLog3(movTmpList[sID].stable[2]);
	/* do calculation based on stored var */
	//if(movTmpList[sID].recStable.length >= 5) {
	//	var tmpI;
	//	var devVector = [];
	//	var tmpII;
	//	for(tmpII in movTmpList[sID].recStable[0]) {
	//		devVector[tmpII] = [];
	//		devVector[tmpII][0] = movTmpList[sID].recStable[0][tmpII];
	//	}
	//	for(tmpI = 1; tmpI < 5; tmpI++) {
	//		for(tmpII in movTmpList[sID].recStable[tmpI]) {
	//			devVector[tmpII][tmpI] = movTmpList[sID].recStable[tmpI][tmpII];
	//		}
	//	}
	//	/* do calculation */
	//	
	//	movTmpList[sID].recStable.shift();
	//}
	var tmpI;
	var count = 0;
	for(tmpI in movTmpList[sID].stable) {
		if(movTmpList[sID].stable[tmpI] > 8){
			count++;
		}
	}
	if((count / movTmpList[sID].stable.length) > 0.5) {
		/* send notification */
		movTmpList[sID].mvFlag = true;
	}
}

function localize(sID, bsTmpListLoc, timeStamp) {
	/* get all bsXY and RSSI */
	var tmpI;
	var X = [];
	var Y = [];
	var RSSI = [];
	var D = [];

	for(tmpI in bsTmpListLoc) {
		X[tmpI] = baseStation[bsTmpListLoc[tmpI]].X;
		Y[tmpI] = baseStation[bsTmpListLoc[tmpI]].Y;
		RSSI[tmpI] = sensorList[sID].bsList[bsTmpListLoc[tmpI]].rssiEst;
	}

	/* RSSi to D */
	D[2] = 1;
	D[1] = 1;
	D[0] = 1.414;

	local_equ(X, Y, D,timeStamp);
	bsTmpList = [];
}

function local_equ(X,Y,D,timeStamp)
{
	/* localization */
	/*xyz123*/
	x1 = X[0];
	x2 = X[1];
	x3 = X[2];
	y1 = Y[0];
	y2 = Y[1];
	y3 = Y[2];
	z1 = Z[0];
	z2 = Z[1];
	z3 = Z[2];
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
	d3 = D[2];
	d2 = D[1];
	d1 = D[0];
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
