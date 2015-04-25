var fs = require("fs");
var util = require("util");
var express = require("express");
var bodyParser = require("body-parser");
var multer = require("multer");
var busboy = require('connect-busboy');
var stylus = require("stylus");
var nib = require("nib");

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
	}
	debug_log.write(util.format(msgHead+d) + '\n');
	stdout.write(util.format(msgHead+d) + '\n');
};
console.cError = function(d,req) {
	var msgHead = "Time: "+Date.now();
	if(typeof req != 'undefined') {
		msgHead += " reqIndex: "+req.reqIndex+
			" reqType: "+req.method+" ";
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

	/* to handle POST and JSON format */
	//app.use(bodyParser.urlencoded({ extended: false}));
	//app.use(bodyParser.urlencoded({ extended: true}));
	//app.use(bodyParser.json({ type: 'application/json' }));
	
	/* to upload file */
	//app.use(busboy()); //used to parse form data from HTML

	/* to use jade & stylus */
	//app.set('views', __dirname + '/../views');
	//app.set('view engine', 'jade');
	//app.use(stylus.middleware({ 
	//	src: __dirname + '/../public',
	//	compile: compile
	//}));
	//app.use(express.static(__dirname + '/../public'));
	
	/*set route*/
	//app.use('/api',apiRouter);
	//app.use('/file',fileRouter);
	//app.use('/page',pageRouter);

	/*test field*/
	//app.post("/api/JSONecho", function(req,res){
	//	var aa = req.body;
	//	console.log(aa);
	//	res.send(aa);
	//});
	/************/

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


exports.start = start;
