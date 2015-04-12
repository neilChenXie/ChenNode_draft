var server = require("./server");
var router = require('./router');
var apiHandler = require('./apiHandler');
var webHandler = require('./webHandler');

var apiH = {};
var webH = {};

webH['/'] = webHandler.index;
//webH = webHandler.index;
apiH['/start'] = apiHandler.start;
apiH['/upload'] = apiHandler.upload;
var handle = {
	api:apiH,
	web:webH
};

server.start(router.route,handle);
