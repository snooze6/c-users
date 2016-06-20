var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');

var User = mongoose.model('User');
var verify = require('../verify/verify');


/* GET users listing. */
router.route('/')
    .get(function(req, res, next) {
      User.find({},{"salt":0, "hash":0}).exec(function (err, user) {
        if (err) return next(err);
        res.json(user);
      });
    })
    .delete(function (req, res, next) {
      User.remove({}, function (err, auxtest) {
        if (err) return next(err);
        res.json(auxtest);
      });
    })
    .post(function(req, res, next){
      if(!req.body.username || !req.body.password){
        return res.status(400).json({message: 'Please fill out all fields'});
      }

      var user = new User();
      user.username = req.body.username;
      user.setPassword(req.body.password);

      user.save(function (err, user){
        if(err) return next(err);
        return res.json({
              user: user,
              token: user.generateJWT()
            })
      });
    });

  router.post('/login', function(req, res, next){
    if(!req.body.username || !req.body.password){
      return res.status(400).json({message: 'Please fill out all fields'});
    }

    passport.authenticate('local', function(err, user, info){
      if(err) return next(err);
      if(user){
        return res.json(
            {
                // user: user,
                token: user.generateJWT()
            });
      } else {
        return res.status(401).json(info);
      }
    })(req, res, next);
  });

    // var jwt = require('express-jwt');
    // var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

    router.route('/cookies')
        .get(verify.auth, function (req, res, next) {
            console.log('Cookies');
            res.json({cookies: 'Lots of cookies'})
        });
    router.route('/isValid')
        .get(verify.verifyOrdinaryUser, function (req, res, next) {
            console.log('Cookies');
            res.json({cookies: 'Lots of cookies', user: {username: req.decoded.username, "_id": req.decoded._id}})
    });

    router.route('/isAdmin')
        .get(verify.verifyOrdinaryUser, verify.verifyAdminUser, function (req, res, next) {
            console.log('Cookies');
            res.json({cookies: 'Lots of admin cookies', user: {username: req.decoded.username, "_id": req.decoded._id}})
        });





module.exports = router;
