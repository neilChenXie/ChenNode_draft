var fs = require('fs');
var mime = require('mime');
var config = require('../../config.js').config();
var rv = {
	index:index,
	upload:uploadHanddler,
	uploadProcess:uploadProcess,
	download:downloadHanddler
};

function index(req, res) {
	res.render('index',
			{title:'Home'}
			);
}
function uploadHanddler(req, res) {
	//res.status(200).send("funciton not finished");
	res.status(200);
	res.render('upload',
			{title:'Upload'}
			);
}
function uploadProcess(req,res) {
	//console.log(req.files.displayImage.path);
	var fstream;
	req.pipe(req.busboy);
	req.busboy.on('file', function (fieldname, file, filename) {
		console.log("Uploading: " + filename); 
		fstream = fs.createWriteStream(config.file.uploadBase + filename);
		file.pipe(fstream);
		fstream.on('close', function () {
			res.redirect('back');
		});
	});
}

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
