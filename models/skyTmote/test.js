var myDB = require('./db.js');
var newBS = {
	bsID:1,
	X:1,
	Y:2,
	Z:3
};
var newLine = {
	bsID:1,
	sensorID:15,
	rssi:-68
};
myDB.start();
//myDB.addBS(newBS);
myDB.addRaw(newLine);
