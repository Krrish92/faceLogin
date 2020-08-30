const MongoClient = require( 'mongodb' ).MongoClient;
const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;
// mongoose.set('debug', true);
let _db;
const MONGO_DB_URL = `mongodb://localhost:27017/faceData?authSource=admin`; 
const MONGOOSE_OPTIONS = {
    autoIndex: false, // Don't build indexes
    reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0,
    connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4, // Use IPv4, skip trying IPv6,\
    keepAlive: true, 
    keepAliveInitialDelay: 300000
  };
  

module.exports = {
	connectToDBServer: connectToDBServer,
	coonectToMongooseDbServer: coonectToMongooseDbServer,
	getDb: getDb
};

function connectToDBServer(callback){
	/*MongoClient connection pooling : db object will be re-used when new connections to the database are required.*/
	MongoClient.connect(MONGO_DB_URL,{poolSize: 4}, function( err, db ) {
		if(err){
			console.log('Unable to connect to MongoDB Server. Error: ' + err);
		}
		_db = db;
		console.log('connected to database :: ' + MONGO_DB_URL);
		return callback( true );;
	});
}

async function coonectToMongooseDbServer() {
	return new Promise((resolve) => {
	mongoose.connect(MONGO_DB_URL,MONGOOSE_OPTIONS,function(err) {
		if(err){
			console.log('Unable to connect to MongoDB Server. Error: ' + err);
		}
		console.log('connected to mongoose database :: ' + MONGO_DB_URL);
		resolve(true)
	});
	})
}

function getDb() {
	return _db;
}
