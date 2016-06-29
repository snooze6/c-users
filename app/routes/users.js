var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var passport = require('passport');

var User = mongoose.model('User');
var verify = require('../verify/verify');

var config = require('../../config/config');


/* GET users listing. */
router.route('/')
    .get(function(req, res, next) {
        if (config.verbose) {
            console.log(config.vtag+"GET USERS");
        }
      User.find({},{"salt":0, "hash":0}).exec(function (err, user) {
        if (err) return next(err);
        res.json(user);
      });
    })
    .delete(function (req, res, next) {
        if (config.verbose) {
            console.log(config.vtag+"DELETE USERS");
        }
      User.remove({}, function (err, auxtest) {
        if (err) return next(err);
        res.json(auxtest);
      });
    })
    .post(function(req, res, next){
      if(!req.body.username || !req.body.password){
        return res.status(400).json({message: 'Please fill out all fields'});
      }
        if (config.verbose) {
            console.log(config.vtag+"POST USER [Login: "+req.body.username+"] [Pass: "+req.body.password+"]");
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
      if (config.verbose) {
          console.log(config.vtag+"LOGIN USER [Login: "+req.body.username+"] [Pass: "+req.body.password+"]");
      }

    passport.authenticate('local', function(err, user, info){
        if (config.verbose){
            console.log(config.vtag+"AUTHENTICATING USER [Login: "+req.body.username+"] [Pass: "+req.body.password+"]");
        }

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

    router.route('/cookies')
        .get(verify.auth, function (req, res, next) {
            if (config.verbose) {
                console.log(config.vtag+"GET COOKIES");
            }
            res.json({cookies: 'Lots of cookies'})
        });
    router.route('/isValid')
        .get(verify.verifyOrdinaryUser, function (req, res, next) {
            if (config.verbose) {
                console.log(config.vtag+"VALID USER [Login: "+req.decoded.username+"] [_id: "+req.decoded._id+"]");
            }
            res.json({cookies: 'Lots of cookies', user: {username: req.decoded.username, "_id": req.decoded._id}})
    });

    router.route('/isAdmin')
        .get(verify.verifyOrdinaryUser, verify.verifyAdminUser, function (req, res, next) {
            if (config.verbose) {
                console.log(config.vtag+"ADMIN USER [Login: "+req.decoded.username+"] [_id: "+req.decoded._id+"]");
            }
            res.json({cookies: 'Lots of admin cookies', user: {username: req.decoded.username, "_id": req.decoded._id}})
        });

    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    router.get('/login/facebook', passport.authenticate('facebook'),  function(req, res) {});

    // handle the callback after facebook has authenticated the user
    router.get('/login/facebook/callback', function(req, res, next){
        passport.authenticate('facebook', function(err, user, info){
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.status(401).json({
                    err: info
                });
            }

            req.logIn(user, function(err) {
                if (err) {
                    console.log(config.etag+'Error al hacer login: '+err);
                    return res.status(500).json({
                        err: 'Could not log in user'
                    });
                }
                var token = verify.getToken(user);
                res.status(200).json({
                    status: 'Login successful!',
                    success: true,
                    token: token
                });
            });
        })(req,res,next);
        }
    );

    // =====================================
    // TWITTER ROUTES ======================
    // =====================================
    // route for twitter authentication and login
    router.get('/login/twitter', passport.authenticate('twitter'), function(req, res) {});

    // handle the callback after twitter has authenticated the user
    router.get('/login/twitter/callback', function(req, res, next){
            passport.authenticate('twitter', function(err, user, info){
                if (err) {
                    return next(err);
                }
                if (!user) {
                    return res.status(401).json({
                        err: info
                    });
                }

                req.logIn(user, function(err) {
                    if (err) {
                        console.log(config.etag+'Error al hacer login: '+err);
                        return res.status(500).json({
                            err: 'Could not log in user'
                        });
                    }
                    var token = verify.getToken(user);
                    res.status(200).json({
                        status: 'Login successful!',
                        success: true,
                        token: token
                    });
                });
            })(req,res,next);
        }
    );

    // route for logging out
    router.get('/logout', function(req, res) {
        req.logout();
    });



module.exports = router;
