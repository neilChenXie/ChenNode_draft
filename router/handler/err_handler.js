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
		  // respond with html page
		  //if (req.accepts('html')) {
		  //    res.render('404', { url: req.url });
		  //    return;
		  //}

		  //// respond with json
		  //if (req.accepts('json')) {
		  //    res.send({ error: 'Not found' });
		  //    return;
		  //}

		  //// default to plain-text. send()
}


exports.get = function() {
	return rv;
};
