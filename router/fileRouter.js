var config = require("../config").config();
var express = require("express");
var router = express.Router();
var handler = require(config.router.handler_base + 'handler').get();
//var busboy = require("connect-busboy");

/* middleware specific to this router */
router.use(function timeLog(req, res, next) {
	/*record request information*/
	var entry;
	entry = "/file ";
	entry += "PATH: "+req.url;
	console.cDebug(entry, req);
	next();
});
/*****************************************/

/************get functions************/
router.get('/timeout', handler.test.timeoutTest);
router.get('/test', handler.test.jsonTest);
router.get('/upload', handler.file.reUpload);

/************post functions***********/
router.post('/upload', handler.file.upload);

/************file functions***********/
router.get('/index',handler.file.index);
router.get('/download/*',handler.file.download);

/************err function*************/
router.get('*',handler.err.notFound);

module.exports = router;
