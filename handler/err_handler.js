var fs = require('fs');
var mime = require('mime');

function timeoutHandler () {
}

function notFoundHandler(req,res) {
	res.status(404);
	file = '/home/chen/Documents/error/404.png';
	fs.exists(file, function(exist) {
		if(exist) {
			//var fileType = mime.lookup(file);
			//res.set("Content-disposition",'attachment; filename=notFound.png');
			//res.type('png');
			res.sendFile(file);
		} else {
			console.cError("404.png is not there", req);
			res.send("not found");
		}
	});
	return;
}


var rv = {
	timeout: timeoutHandler,
	notFound: notFoundHandler
};

exports.get = function() {
	return rv;
};
