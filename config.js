/*need modification for portable*/
var user = "chen";

/* server.js */
var server = {
	port:8080,
	router_base:__dirname + "/router/",
	log_debug_base:__dirname + "/log/debug.txt",
	log_error_base:__dirname + "/log/error.txt"
};

/* router/*router.js */
var router = {
	timeout:2000000,
	handler_base:__dirname + "/handler/"
};
/* handler/*handler.js */
var file = {
	downloadBase:"/home/"+user+"/Documents/download/",
	uploadBase:"/home/"+user+"/Documents/download/"
};

/* handler/apiProject/*.js */
var skyTmote = {
	log_base: __dirname + "/log/skyTmote/",
	model_base: __dirname + "/models/skyTmote/"
};

var config = {
	server:server,
	router:router,
	file:file,
	skyTmote:skyTmote
};

exports.config = function () {
	return config;
};
