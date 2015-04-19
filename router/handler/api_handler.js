var skyTmote = require('./apiProject/skyTmote').get();

/*return object*/
var rv = {
	skyTmote:skyTmote,
};

/*general function not project related*/
//function foo() {
//
//}

exports.get = function() {
	return rv;
};
