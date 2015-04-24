var routerConfig = {
	timeout:2000000
};

/* for server/server.js configuration */
var serverConfig = {
	port:8080,
	log_debug_base:"/../log/debug.txt",
	log_error_base:"/../log/error.txt"
};
var fileConfig = {
	downloadBase:"/home/chen/Documents/download/",
	uploadBase:"/home/chen/Documents/download/"
};
var config = {
	server:serverConfig,
	router:routerConfig,
	file:fileConfig
};
exports.config = function () {
	return config;
};
