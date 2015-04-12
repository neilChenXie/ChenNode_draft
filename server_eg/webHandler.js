var path = require('path');

function index(request,response) {
	console.log('get request');
	response.sendFile(path.join(__dirname+'/index.html'));
}

exports.index = index;
