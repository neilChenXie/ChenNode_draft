npm module:
	mysql
	express
	mime
	jade
	stylus
	nib
	multer
	busboy

Notes:
2015-0412: add fileConfig in config.js, make download source folder changable
2015-0413: add log system
2015-0417: add POST and JSON support
2015-0418: add skyProject under /api router
2015-0420: add RTT-estimation like RSSI algorithm in /api/skyTmote project. Managed models folder.
2015-0421: fix log time stamp bug, and Localization algorithm in /api/skyTmote project.
2015-0422: fix bugs in coordinate algorithm
2015-0422: add jade & stylus to support HTML and CSS for nodejs server
2015-0423: add file upload
2015-0424: changed log system, move file upload page from file_handler to page_handler
2015-0425: make the system portable with any Linux system by rewriting config file, and module require way in all files, remove timeout in router,
2015-0426:create session function, finished package.json
