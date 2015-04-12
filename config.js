var routerConfig = {
	timeout:2000000
};
var serverConfig = {
	port:8080
};
var config = {
	server:serverConfig,
	router:routerConfig
};
exports.config = function () {
	return config;
};
