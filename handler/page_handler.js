var file = {
	uploadPage:fileUpload
};

function fileUpload(req, res) {
	//res.status(200).send("funciton not finished");
	console.cDebug("handler:page.file.uploadPage", req);
	res.status(200);
	res.render('upload', {title:'Upload'}, function(err, html){
		if(!err) {
			res.send(html);
		} else {
			console.cError(err,req);
		}
	});
}

var rv = {
	file:file		
};

exports.get = function() {
	return rv;
};
