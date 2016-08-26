/**
 * Created by snooze on 6/20/16.
 */

var config = require('./config/config');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
// var UserSchema = require('./app/models/user');
var User = null;

var passport = require('passport');

function parseargs(args){
    config.verbose = args.verbose || true;
    config.vtag = args.tag || '[DEBUG] -- ';
    config.this = args.this || 'http://localhost:3000';

    if (config.verbose){
        console.log(config.vtag+'This: '+config.this)
    }

    if (args.path) {
        config.path = args.path;
        if (args.mongoUrl) {
            config.mongoUrl = args.mongoUrl;
            if (args.app) {
                config.app = args.app;
                if (args.SECRET) {
                    config.secretKey = args.SECRET;

                    if (args.FACEBOOK_APPID && args.FACEBOOK_SECRET) {
                        config.hasFacebook = true;
                        config.FACEBOOK_APPID = args.FACEBOOK_APPID;
                        config.FACEBOOK_SECRET = args.FACEBOOK_SECRET;
                        config.FACEBOOK_CALLBACK = config.this+args.path+'/login/facebook/callback/';
                        if (config.verbose) {
                            console.log(config.vtag + 'Facebook support configured [APPID: ' + config.FACEBOOK_APPID + '] - [SECRET: ' + config.FACEBOOK_SECRET + '] - [CALLBACK: '+config.FACEBOOK_CALLBACK+']');
                        }
                    } else {
                        if (config.verbose)
                            console.log(config.wtag + 'Facebook support not configured');
                    }

                    if (args.TWITTER_KEY && args.TWITTER_SECRET) {
                        config.hasTwitter = true;
                        config.TWITTER_KEY = args.TWITTER_KEY;
                        config.TWITTER_SECRET = args.TWITTER_SECRET;
                        config.TWITTER_CALLBACK = config.this+args.path+'/login/twitter/callback/';
                        if (config.verbose) {
                            console.log(config.vtag + 'Twitter support configured [APPID: ' + config.TWITTER_KEY + '] - [SECRET: ' + config.TWITTER_SECRET + '] - [CALLBACK: '+config.TWITTER_CALLBACK+']');
                        }
                    } else {
                        if (config.verbose)
                            console.log(config.wtag + 'Twitter support not configured');
                    }

                    if (args.GOOGLE_APPID && args.GOOGLE_SECRET) {
                        config.hasGoogle = true;
                        config.GOOGLE_APPID = args.GOOGLE_APPID;
                        config.GOOGLE_SECRET = args.GOOGLE_SECRET;
                        config.GOOGLE_CALLBACK = config.this+args.path+'/login/google/callback/';
                        if (config.verbose) {
                            console.log(config.vtag + 'Google support configured [APPID: ' + config.GOOGLE_APPID + '] - [SECRET: ' + config.GOOGLE_SECRET + '] - [CALLBACK: '+config.GOOGLE_CALLBACK+']');
                        }
                    } else {
                        if (config.verbose)
                            console.log(config.wtag + 'Google support not configured');
                    }

                    if (args.model) {
                        console.log(config.vtag + 'Model configured');
                        console.log(config.vtag + args.model.toString())
                    }
                    require('./app/models/user').setup(args.model);
                    User = mongoose.model('User');

                    return true;
                } else {
                    console.log(config.etag + 'Must specify a secret key');
                    return false;
                }
            } else {
                console.log(config.etag + 'Must specify an app');
                return false;
            }
        } else {
            console.log(config.etag + 'Must specify a mongoUrl');
            return false;
        }
    } else {
        console.log(config.etag + 'Must specify a URL');
        return false;
    }
}

var doTheThing = function (args) {
    if (parseargs(args)){
        if (config.verbose) {
            console.log(config.vtag + 'Setup called - Path: ' + config.path + ' - MongoURL: ' + config.mongoUrl);;
        }

        mongoose.connect(config.mongoUrl);
        var db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function () {
            // we're connected!
            if (config.verbose)
                console.log(config.vtag+"Connected correctly to server");
        });

        var session = require('express-session');
        config.app.use(session({
            resave: false,
            saveUninitialized: true,
            secret: config.secretKey
        }));

        config.app.use(passport.initialize());
        config.app.use(passport.session());
        require('./config/passport').setup(passport);

        var routerUsers = require('./app/routes/users');

        config.app.use(config.path, routerUsers);
    } else {
        throw new Error(tag+'Incorrect parameters');
    }
};

var decrypt = function (token) {
    return new Promise(function (fulfill, reject){
        if (token) {
            jwt.verify(token, config.secretKey, function (err, decoded) {
                if (!err) {
                    // if everything is good, save to request for use in other routes
                    // console.log(decoded);
                    fulfill(decoded);
                } else {
                    reject(err)
                }
            });
        } else {
            reject(new Error('No token provided'))
        }
    });
};

var resolve = function (username) {
    return new Promise(function (fulfill, reject){
        if (username) {
            User.find({"username": username}, {"salt": 0, "password": 0}).exec(function (err, user) {
                if (err) {
                    reject(err)
                } else {
                    // console.log(user);
                    if (user && user[0] && user[0]._id)
                        fulfill(user[0]._id);
                    else
                        reject(new Error('User not found'))
                }
            });
        } else {
            reject(new Error('Not username provided'))
        }
    });
};

/**
 * Escape special characters in the given string of html.
 *
 * @param  {String} html
 * @return {String}
 */
module.exports = {
    setup: doTheThing,
    verify: require('./app/verify/verify')
};