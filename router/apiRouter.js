var config = require("../config").config();
var express = require("express");
var router = express.Router();
var handler = require(config.router.handler_base + 'handler').get();

/* middleware specific to this router */
router.use(function timeLog(req, res, next) {
	/*record request information*/
	var entry;
	entry = "/api ";
	entry += "PATH: "+req.url;
	console.cDebug(entry,req);
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
/*****************************************/

/************get functions************/
router.get('/', handler.test.timeoutTest);
router.get('/test', handler.test.jsonTest);

/************post functions***********/
router.post('/JSONecho',handler.test.JSONecho);
router.post('/skyTmote/save',handler.api.skyTmote.save);
/************err function*************/
router.get('*',handler.err.notFound);

module.exports = router;
