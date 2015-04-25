var myDB = require('./db.js');
var newBS = {
	bsID:1,
	X:0,
	Y:0,
	Z:0
};
var newLine = {
	bsID:1,
	sensorID:15,
	rssi:-68
};
myDB.start();
myDB.addBS(newBS);
//myDB.addRaw(newLine);
