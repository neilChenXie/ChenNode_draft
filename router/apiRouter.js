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
	next();
});
/*****************************************/

/************get functions************/
router.get('/', handler.test.timeoutTest);
router.get('/test', handler.test.jsonTest);
router.get('/fileList', handler.api.fileList);

/************post functions***********/
router.post('/JSONecho',handler.test.JSONecho);
router.post('/skyTmote/save',handler.api.skyTmote.save);
/************err function*************/
router.get('*',handler.err.notFound);

module.exports = router;
