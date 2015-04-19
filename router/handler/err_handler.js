var fs = require('fs');
var mime = require('mime');
var rv = {
	timeout: timeoutHandler,
	notFound: notFoundHandler
};

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
			console.error("404.png is not there");
			res.send("not found");
		}
	});
	return;
}


exports.get = function() {
	return rv;
};
