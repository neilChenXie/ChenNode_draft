var routerConfig = {
	timeout:2000000
};
var serverConfig = {
	port:8080
};
var fileConfig = {
	downloadBase:"/home/chen/Documents/",
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
