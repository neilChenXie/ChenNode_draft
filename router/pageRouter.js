var express = require("express");
var router = express.Router();
var config = require("../config").config();
var handler = require('./handler/handler').get();

/* middleware specific to this router */
router.use(function timeLog(req, res, next) {
	/*record request information*/
	var entry;
	entry = "/page ";
	entry += "PATH: "+req.url;
	console.cDebug(entry, req);
	/*set timeout*/
	res.setTimeout(config.router.timeout, function(){
		/*send timeout status back*/
		res.sendStatus(408);
		/*print err msg*/
		entry += "Timeout";
		entry = "err: " + entry;
		console.cError(entry, req);
	});
	next();
});

/************get functions************/
router.get('/', handler.test.timeoutTest);
router.get('/test', handler.test.jsonTest);


/************err function*************/
router.get('*',handler.err.notFound);
module.exports = router;

module.exports = router;
