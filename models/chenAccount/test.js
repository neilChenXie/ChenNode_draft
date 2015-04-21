var mysql = require("mysql");

var dbInfo = {
	"hostname":"localhost",
	"user":"root",
	"password":"121",
	"database":"account"
};

var db = new mysql.createConnection(dbInfo);
db.connect(function() {
	console.log(arguments.length);
});
db.query("select * from User",function(){
	console.log(arguments);
});
