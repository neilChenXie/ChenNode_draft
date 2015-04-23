var fs = require("fs");
var util = require("util");
var express = require("express");
var bodyParser = require("body-parser");
//var multer = require("multer");
var busboy = require('connect-busboy');
var stylus = require("stylus");
var nib = require("nib");
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
console.log = function(d) { //
	var msgHead = "Time: "+Date.now()+" ";
	debug_log.write(util.format(msgHead+d) + '\n');
	stdout.write(util.format(msgHead+d) + '\n');
};
console.error = function(d) {
	var msgHead = "Time: "+Date.now()+" ";
	error_log.write(util.format(msgHead+__dirname+" "+d) + '\n');
	stdout.write(util.format(msgHead+__dirname+" "+d) + '\n');
};

/* for stylus */
function compile(str, path) {
	return stylus(str)
		.set('filename', path)
		.use(nib());
}

function start() {

	/* to handle POST and JSON format */
	app.use(bodyParser.urlencoded({ extended: false}));
	app.use(bodyParser.json({ type: 'application/json' }));
	
	/* to upload file */
	//app.use(multer({ dest: '~/Documents/download/'}));
	app.use(busboy());

	/* to use jade & stylus */
	app.set('views', __dirname + '/../views');
	app.set('view engine', 'jade');
	app.use(stylus.middleware({ 
		src: __dirname + '/../public',
		compile: compile
	}));
	app.use(express.static(__dirname + '/../public'));

	/*set route*/
	app.use('/api',apiRouter);
	app.use('/file',fileRouter);
	app.use('/page',pageRouter);

	/*test field*/
	//app.post("/api/JSONecho", function(req,res){
	//	var aa = req.body;
	//	console.log(aa);
	//	res.send(aa);
	//});
	/************/
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
