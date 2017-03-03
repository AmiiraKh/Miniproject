var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema; 
//var user = require('./models/user');

var WorkSchema = mongoose.Schema({
	title: {
		type: String
	},
	description: {
		type: String
	},
	image: {
		type: String
	},
	user: [{
		type: Schema.Types.ObjectId, ref: 'user'
	}]
});


var Work = mongoose.model("Work", WorkSchema); 
module.exports = Work;

module.exports.createWork = function(newUser, callback){
	        newUser.save(callback);
}