var fs = require("fs");
var util = require("util");
var express = require("express");
var bodyParser = require("body-parser");
var multer = require("multer");
var busboy = require('connect-busboy');
var stylus = require("stylus");
var nib = require("nib");
var timeout = require("connect-timeout");
/* system structure */
var app = express();
var api = express();
var file = express();
var page = express();

/*configuration*/
var config = require("./config").config();

/*router related*/
var apiRouter = require(config.server.router_base + "apiRouter");
var fileRouter = require(config.server.router_base + "fileRouter");
var pageRouter = require(config.server.router_base + "pageRouter");

/* log system related */
var reqIndex = 0;  	//single thread

var debug_log = fs.createWriteStream(config.server.log_debug_base, {flags : 'w'});
var error_log = fs.createWriteStream(config.server.log_error_base, {flags : 'w'});
var stdout = process.stdout;
console.cDebug = function(d,req) { //
	var msgHead = "Time: "+Date.now();
	if(typeof req != 'undefined') {
		msgHead += " reqIndex: "+req.reqIndex+
			" reqType: "+req.method+" ";
	} else {
		msgHead += ' ';
	}
	debug_log.write(util.format(msgHead+d) + '\n');
	stdout.write(util.format(msgHead+d) + '\n');
};
console.cError = function(d,req) {
	var msgHead = "Time: "+Date.now();
	if(typeof req != 'undefined') {
		msgHead += " reqIndex: "+req.reqIndex+
			" reqType: "+req.method+" ";
	} else {
		msgHead += ' ';
	}
	error_log.write(util.format(msgHead+d) + '\n');
	stdout.write(util.format(msgHead+d) + '\n');
};

/* for stylus */
function compile(str, path) {
	return stylus(str)
		.set('filename', path)
		.use(nib());
}

/* service configuration */
function apiConfig() {

	/* to handle POST and JSON format */
	api.use(bodyParser.urlencoded({ extended: true}));
	api.use(bodyParser.json({ type: 'application/json' }));
	api.use('/',apiRouter);
}

function pageConfig() {

	/* HTML and CSS support */
	page.set('views', __dirname + '/views');
	page.set('view engine', 'jade');
	page.use(stylus.middleware({ 
		src: __dirname + '/public',
		compile: compile
	}));

	/* normal form info parse */
	page.use(bodyParser.urlencoded({ extended: true}));
	page.use(bodyParser.json({ type: 'application/json' }));

	/* setup route */
	page.use('/',pageRouter);
}

function fileConfig() {

	/* parse multipart from HTML form */
	file.use(busboy());

	/* setup route */
	file.use('/',fileRouter);
}

function start() {

	/* log system related */
	app.all('/*', function(req,res,next) { 

		/* add reqIndex element */
		if(typeof req.reqIndex == 'undefined' ) {
			 reqIndex++;
			 req.reqIndex = reqIndex;
		}
		next();
	});

	app.use(express.static(__dirname + '/public'));
	//app.use(timeout('100s'));
	//app.use(haltOnTimeout);
	
	apiConfig();
	pageConfig();
	fileConfig();
	app.use('/api',api);
	app.use('/file',file);
	app.use('/page',page);
	/*start server*/
	server = app.listen(config.server.port,
			function () {
				var host = server.address().address;
				var port = server.address().port;
				console.log("server :"+host+":"+port);
			}
	);
}

function haltOnTimeout(req,res,next) {
	if(!req.timeout) next();
	else {
		console.cError("request time out");
		res.sendStatus(408);
	}
}


exports.start = start;
