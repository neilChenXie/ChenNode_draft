var skyTmote = require('./apiProject/skyTmote').get();


/*general function not project related*/
//function foo() {
//
//}

/*return object*/
var rv = {
	skyTmote:skyTmote,
};

exports.get = function() {
	return rv;
};
