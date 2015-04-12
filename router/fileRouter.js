var express = require("express");
var router = express.Router();
var config = require("../config").config();
var handler = require('./handler/handler').get();

/* middleware specific to this router */
router.use(function timeLog(req, res, next) {
	/*record request information*/
	var entry;
	entry = "Time: "+Date.now()+" ";
	entry += "PATH: "+req.url;
	console.log(entry);
	/*set timeout*/
	res.setTimeout(config.router.timeout, function(){
		/*send timeout status back*/
		res.sendStatus(408);
		/*print err msg*/
		entry += "Timeout";
		entry = "err: " + entry;
		console.log(entry);
	});
	next();
});
/*****************************************/

/************get functions************/
router.get('/', handler.api.timeoutTest);
router.get('/about', handler.api.jsonTest);

/************post functions***********/

/************file functions***********/
router.get('/download/*',handler.file.download);

/************err function*************/
router.get('*',handler.err.notFound);

module.exports = router;
