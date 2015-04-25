
function timeoutTest() {
}

function jsonTest(req,res) {
	res.send(JSON.stringify({"name":"chen"}));
}

function JSONecho(req,res) {
	var jsonMsg = req.body;
	//console.cDebug();
	res.tyep('json');
	res.status(200).send(jsonMsg);
}

var rv = {
	timeoutTest:timeoutTest,
	jsonTest:jsonTest,
	JSONecho:JSONecho
};

exports.get = function() {
	return rv;
};
