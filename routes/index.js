var express = require('express');
var router = express.Router();
var User = require("../models/user");
var Work = require("../models/work");

router.get('/', function(req, res){ 
	var query = Work.find({});
    query.exec(function (err, docs) {
        if (err) {
            throw Error;
        }
        res.render('index', {users: docs});
    });
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