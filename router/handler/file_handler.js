var fs = require('fs');
var mime = require('mime');
var config = require('../../config.js').config();
var rv = {
	download:downloadHanddler
};

function downloadHanddler(req, res) {
	var allElement = req.url.split('/');
	var filename = allElement[allElement.length - 1];
	var	down_path = req.url;
	//var file = __dirname + '/../..'+down_path;
	var file = config.file.downloadBase+down_path;
	//console.log(file);

	fs.exists(file,function(exist) {
		if(exist) {
			
			/*set MIME type*/
			mimetype = mime.lookup(file);
			//res.setHeader("Content-type",mimetype);
			res.type(mimetype);

			/*set filename*/
			//res.setHeader("Content-disposition",'attachment; filename='+filename);
			res.set("Content-disposition",'attachment; filename='+filename);

			/*start transition*/
			//var filestream = fs.createReadStream(file);
			//filestream.pipe(res);
			res.download(file, function(err) {
				if(err) {
					console.error(err);
				} else {
					console.log("download succeed");
				}
			});
		} else {

			/*file noe exist*/
			msg = "file is not exist";
			res.send(msg);
			console.error(req.url+" "+msg);
		}
	});
}

/*exports the module*/
exports.get = function() {
	return rv;
};
