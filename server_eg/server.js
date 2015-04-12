var http = require("http");
var url = require('url');
var express = require('express');
var app = express();

function start(route,handle) {
	//admin server
	var server = http.createServer(reaction);
	server.listen(19123);
	//html file server
	app.get('/',handle.web['/']);
	app.listen(8080);

	console.log('Server has started');

	function reaction (request, response) {
		var pathname = url.parse(request.url).pathname;
		console.log('Request for '+pathname+' received.');
		
		route(request, handle.api, pathname, response);

		//response.writeHead(200, {"Content-Type":"text/plain"});
		//response.write('hello world');
		//response.end();
	}
}

exports.start = start;
