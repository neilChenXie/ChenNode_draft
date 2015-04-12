/*return object*/
var rv = {
	timeoutTest:timeoutTest,
	jsonTest:jsonTest
};

function timeoutTest() {
}
function jsonTest(req,res) {
	res.send(JSON.stringify({"name":"chen"}));
}
exports.get = function() {
	return rv;
};
