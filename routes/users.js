var express = require('express');
var router = express.Router();
var passport = require('passport');
var multer  = require('multer');
var upload = multer({ dest: 'public/uploads/' });
var LocalStrategy = require('passport-local').Strategy;
var uniqueValidator = require('mongoose-unique-validator');


var User = require('../models/user');
var Work = require('../models/work');

// Register
router.get('/register', function(req, res){
	res.render('register');
});

// Login
router.get('/login', function(req, res){
	res.render('login');
});

router.get('/profile', ensureAuthenticated, function(req, res){
	// User.find().populate({ path: 'work', model: Work }).exec(function(err, result){
	// 		if(err) throw err;
	// 		res.render('profile', {works:result.work});	
	// 	});
	User.find(function(err,works){
		if(err) res.send(err.message);
		else res.render('profile', {works});

		console.log(works);
	});
	
});

router.post('/profile', ensureAuthenticated, upload.any(), function(req, res){
	var newWork = new Work({
			title: req.title,
			description: req.description,
			image: req.files.originalname,
			user: req.user
		});

	Work.createWork(newWork, function(err, user){
			if(err) throw err;
			console.log(user);
		});

//res.send(req.files);
req.flash('success_msg', 'The file is uploaded');
res.redirect('/');
});

// Register User
router.post('/register', function(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	// User.schema.path('username').validate(function(value, done) {
	// 	User.findOne({username: value}, function(err, user) {
	// 	   if (err) return done(false);
	// 	    if (user) return done(false);
	// 		    done(true);
	// 				}); }, "User exists");

	var errors = req.validationErrors();

	if(errors){
		res.render('register',{
			errors:errors
		});
	} else {
		var newUser = new User({
			name: name,
			email:email,
			username: username,
			password: password
		});

		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

		req.flash('success_msg', 'You are registered and can now login');

		res.redirect('/users/login');
	}
});

passport.use(new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Unknown User'});
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {
    res.redirect('/');
  });

router.get('/logout', ensureAuthenticated,function(req, res){
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('/users/login');
});


//To makesure that users who are logging can't view the views
function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}

module.exports = router;