var file = {
	uploadPage:fileUpload
};
var rv = {
	file:file		
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

exports.get = function() {
	return rv;
};
