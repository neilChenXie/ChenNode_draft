var fs = require('fs');
var mime = require('mime');
var rv = {
	download:downloadHanddler
};

function downloadHanddler(req, res) {
	var allElement = req.url.split('/');
	var filename = allElement[allElement.length - 1];
	var	down_path = req.url;
	var file = __dirname + '/../..'+down_path;

	fs.exists(file,function(exist) {
		if(exist) {
			mimetype = mime.lookup(file);
			//if(mimetype) {
			res.setHeader("Content-disposition",'attachment; filename='+filename);
			res.setHeader("Content-type",mimetype);
			var filestream = fs.createReadStream(file);
			filestream.pipe(res);
		} else {
			res.send("file is not exist");
		}
	});
}
exports.get = function() {
	return rv;
};
