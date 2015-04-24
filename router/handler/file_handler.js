var fs = require('fs');
var mime = require('mime');
var config = require('../../config.js').config();
var rv = {
	index:index,
	upload:uploadHanddler,
	download:downloadHanddler
};

function index(req, res) {
	res.render('index',
			{title:'Home'}
			);
}

/* upload related function */

function uploadHanddler(req,res) {
	//console.cDebug(req.files.displayImage.path);
	var fstream;
	req.pipe(req.busboy);
	req.busboy.on('file', function (fieldname, file, filename) {
		if( filename !== '' ) {
			console.cDebug("Uploading: " + filename, req); 
			fstream = fs.createWriteStream(config.file.uploadBase + filename);
			/* write to disk*/
			file.pipe(fstream);

			/* end of transfer */
			fstream.on('close', function () {
				res.redirect('back');
			});

		}else {
			res.redirect('back');
		}
	});
}
/* * * * * * * *  * * * * * */

/* download related function */
function downloadHanddler(req, res) {
	var allElement = req.url.split('/');
	var filename = allElement[allElement.length - 1];
	//var	down_path = req.url;
	var file = config.file.downloadBase+filename;

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
					console.cError(err,req);
				} else {
					console.cDebug("download succeed", req);
				}
			});
		} else {

			/*file noe exist*/
			msg = "file is not exist";
			res.send(msg);
			console.cError(req.url+" "+msg, req);
		}
	});
}
/* * * * * * * * * * * * * */

/*exports the module*/
exports.get = function() {
	return rv;
};
