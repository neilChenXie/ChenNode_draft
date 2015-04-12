var rv = {
	timeout: timeoutHandler,
	notFound: notFoundHandler
};

function timeoutHandler () {
}

function notFoundHandler(req,res) {
	res.status(404);
	res.type('txt').send('Not Found');
	return;
}


exports.get = function() {
	return rv;
};
