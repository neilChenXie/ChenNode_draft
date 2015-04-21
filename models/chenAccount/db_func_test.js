var db = require("./db.js");
var info_handler = require("./db_info_handler.js");
//db.start();

//db.query(q2,info_handler.show_user);
var q2 = "select * from User";
db.query(q2,info_handler.show_user);


db.dbEnd();
