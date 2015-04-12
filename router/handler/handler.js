var apiHandler = require("./api_handler").get();
var errHandler = require("./err_handler").get();
var fileHandler = require("./file_handler").get();

var rv = {
		api:apiHandler,
		err:errHandler,
		file:fileHandler
};

exports.get = function() {
	return rv;
};

