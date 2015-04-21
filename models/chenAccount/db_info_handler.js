function show_table(err,row,feild) {
	//db.query(queryS, function(err, row, field){
	if(err) throw err;
	var objIndex;
	for(objIndex in row) {
		console.log(row[objIndex]);
	}
	//});
}

function show_account(row) {
	var i;
	console.log("----------user information------------");
	for(i in row) {
		show_account_entry(row[i]);
	}
	console.log("--------------------------------------");
}

function show_account_entry(row) {
	console.log(row.Name+"     ownerid: "+row.UID);
}

function show_user(row) {
	var i;
	console.log("--------account information-----------");
	for(i in row) {
		console.log(row[i].Firstname+" "+row[i].Lastname+" "+" "+row[i].Email);
	}
	console.log("--------------------------------------");
}

exports.show_table = show_table;
exports.show_account = show_account;
exports.show_account_entry = show_account_entry;
exports.show_user = show_user;
