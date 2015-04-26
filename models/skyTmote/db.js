var mysql = require("mysql");
var dbInfo = require("./config").dbInfo();

var db = null;

function start() {
	if(!db) {
		db = new mysql.createConnection(dbInfo);
		db.connect(function(err){ 
			if(err) {
				console.cError(err);
				return -1;
			}
			console.cDebug("database connection setup successfully");
			return db;
		});
	}
	return db;
}

function addBS (bsObj) {
	if(db) {
		query1 = "SELECT * FROM BaseStation WHERE bsID="+bsObj.bsID;
		db.query(query1, function(err, res){
			if(err) {
				console.log("err "+err);
			} else {
				if(res.length < 1) {
					/* insert new one*/
					qS = "INSERT INTO BaseStation VALUES ("+bsObj.bsID+","+bsObj.X+","+bsObj.Y+","+bsObj.Z+");"; 
					db.query(qS,function (err,res){
						if(err) {
							console.error(err);
						} else {
							console.log("insert suc");
						}
					});
				} else {
					/* update the value */
					qS = "UPDATE BaseStation SET X="+bsObj.X+", Y="+bsObj.Y+", Z="+bsObj.Z+" WHERE bsID="+bsObj.bsID+";"; 
					db.query(qS,function (err,res){
						if(err) {
							console.error(err);
						} else {
							console.log("insert suc");
						}
					});
				}
			}
		});
	} else {
		console.cError("Function: "+arguments.callee.name+" Should connect database first");
	}
}

function addLoc(lineObj) {
	if(db) {
		qS = "INSERT INTO Sensor VALUES ("+lineObj.sID+","+lineObj.timeStamp+","+lineObj.X+","+lineObj.Y+")";
		db.query(qS,function (err,res){
			if(err) {
				console.cError(err);
			} else {
				//console.cDebug(res);
				console.cDebug("add sensor Loc suc");
			}
		});
	} else {
		console.cError("Function: "+arguments.callee.name+" Should connect database first");
	}
}
exports.start = start;
exports.addBS = addBS;
exports.addLoc = addLoc;
