var express = require("express");
var app = express();
var apiRouter = require("../router/apiRouter.js");
var fileRouter = require("../router/fileRouter.js");
var config = require("../config.js").config();

function start() {

	/*set route*/
	app.use('/api',apiRouter);
	app.use('/file',fileRouter);
	//app.use(errHandler); //last route

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
