var mysql = require("mysql");
/*information for database*/
var dbInfo = {
	"hostname":"localhost",
	"user":"root",
	"password":"121",
	"database" : "account"
};
/*global variables*/
var DEBUG = true;
var db = null;
/*basic operatio for database*/
function start() {
	if(!db) {
		db= new mysql.createConnection(dbInfo);
		db.connect(function(err){
			if(err) {
				console.log(err);
				return db;
			}
			console.log("database connection success");
			return db;
		});
	}
	return db;
}

function queries(queryString,handler) {
	if(!db) {
		start();
	}
	if(DEBUG)
		console.log("Function: "+arguments.callee.name+" DEBUG: "+queryString);
	//db.query(queryString,handler);
	db.query(queryString,function(err, row,field){
		return handler(row);
	});
}

function streamQueries(queryString, resHandler,errHandler,fieldHanlder,endHandler) {
	if(!db) {
		start();
	}
	if(DEBUG)
		console.log("Function: "+arguments.callee.name+" DEBUG: "+queryString);
	var qs = db.query(queryString);
	if(errHandler)
		qs.on('error',errHandler);
	if(fieldHanlder)
		qs.on('field',fieldHanlder);
	if(resHandler)
		qs.on('result',resHandler);//may need pause
	if(endHandler)
		qs.on('end',endHandler);
}

function dbEnd() {
	db.end();
}
exports.start = start;
exports.query = queries;
exports.streamQuery = streamQueries;
exports.dbEnd = dbEnd;
