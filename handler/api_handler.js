var config = require('../config').config();
var skyTmote = require('./apiProject/skyTmote').get();
var exec = require('child_process').exec;


/*general function not project related*/
function fileList(req, res) {
	//var comm = 'ls -lah '+config.file.downloadBase;
	var comm = 'ls -lah '+config.file.downloadBase;
	exec(comm, function (err, stdout, stderr){
		res.status(200);
		res.type('text/plain');
		console.cDebug(stdout, req);
		res.send(stdout);
	});	
}

/*return object*/
var rv = {
	fileList:fileList,
	skyTmote:skyTmote
};

exports.get = function() {
	return rv;
};
