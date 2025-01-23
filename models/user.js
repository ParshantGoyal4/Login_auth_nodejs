var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/nodeauth');

var db = mongoose.connection;

// User Schema
var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index: true
	},
	password: {
		type: String
	},
	email: {
		type: String
	},
	name: {
		type: String
	},
	profileimage:{
		type: String
	}
});

var User = module.exports = mongoose.model('User', UserSchema);

// module.exports.getUserById = function(id, callback){
// 	User.findById(id, callback);
// }

module.exports.getUserById = async function(id) {
	try {
	  const user = await User.findById(id);  // Using await to handle the asynchronous call
	  return user;  // Return the user object
	} catch (err) {
	  throw new Error('Error retrieving user by ID');  // Handle any errors that occur during the DB query
	}
  };
  

// module.exports.getUserByUsername = function(username, callback){
// 	let query = {username: username};
// 	User.findOne(query, callback);
// 	console.log(username);
// }
module.exports.getUserByUsername = async function(username) {
	try {
	  console.log(`Searching for user with username: ${username}`);
	  const user = await User.findOne({ username: username });
	  console.log(username)
	  return user;  // You can return the user or handle it here as needed.
	} catch (err) {
	  console.error(err);
	  throw new Error('Error fetching user');
	}
  }

// module.exports.comparePassword = function(candidatePassword, hash, callback){
// 	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
//     	callback(null, isMatch);
// 	}) }
module.exports.comparePassword = async function(candidatePassword, hash) {
	try {
	  const isMatch = await bcrypt.compare(candidatePassword, hash);
	  console.log('match')
	  return isMatch;  // Return the result directly
	  
	} catch (err) {
		console.log('err')
	  throw new Error('Error comparing password');
	}
  };
  
  

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
    	bcrypt.hash(newUser.password, salt, function(err, hash) {
   			newUser.password = hash;
   			newUser.save(callback);
    	});
	});
}