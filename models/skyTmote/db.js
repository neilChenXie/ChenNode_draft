var mysql = require("mysql");
var dbInfo = require("./config").dbInfo();

var db = null;

function start() {
	if(!db) {
		db = new mysql.createConnection(dbInfo);
		db.connect(function(err){ 
			if(err) {
				console.error(err);
				return -1;
			}
			console.log("database connection setup successfully");
			return db;
		});
	}
	return db;
}

function addBS (bsObj) {
	if(db) {
		qS = "INSERT INTO BaseStation VALUES ("+bsObj.bsID+","+bsObj.X+","+bsObj.Y+","+bsObj.Z+");"; 
		db.query(qS,function (err,res){
			if(err) {
				console.error(err);
			} else {
				console.log(res);
			}
		});
	} else {
		console.error("Function: "+arguments.callee.name+" Should connect database first");
	}
}

function addRaw(lineObj) {
	if(db) {
		qS = "INSERT INTO Raw VALUES (null,"+lineObj.bsID+","+lineObj.sensorID+","+lineObj.rssi+")";
		db.query(qS,function (err,res){
			if(err) {
				console.error(err);
			} else {
				console.log(res);
			}
		});
	} else {
		console.error("Function: "+arguments.callee.name+" Should connect database first");
	}
}
exports.start = start;
exports.addBS = addBS;
exports.addRaw = addRaw;
