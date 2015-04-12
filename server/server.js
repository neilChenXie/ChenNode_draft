var fs = require("fs");
var util = require("util");
var express = require("express");
var app = express();

/*configuration*/
var config = require("../config.js").config();

/*router related*/
var apiRouter = require("../router/apiRouter.js");
var fileRouter = require("../router/fileRouter.js");
var pageRouter = require("../router/pageRouter.js");

/*log system related*/
var debug_log = fs.createWriteStream(__dirname + '/../log/debug.txt', {flags : 'w'});
var error_log = fs.createWriteStream(__dirname + '/../log/error.txt', {flags : 'w'});
var stdout = process.stdout;
var msgHead = "Time: "+Date.now()+" ";
console.log = function(d) { //
	debug_log.write(util.format(msgHead+d) + '\n');
	stdout.write(util.format(msgHead+d) + '\n');
};
console.error = function(d) {
	error_log.write(util.format(msgHead+__dirname+" "+d) + '\n');
	stdout.write(util.format(msgHead+__dirname+" "+d) + '\n');
};

function start() {

	/*set route*/
	app.use('/api',apiRouter);
	app.use('/file',fileRouter);
	app.use('/page',pageRouter);

	/*start server*/
	server = app.listen(config.server.port,
			function () {
				var host = server.address().address;
				var port = server.address().port;
				console.log("server :"+host+":"+port);
			}
	);
}


exports.start = start;
