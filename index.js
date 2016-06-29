/**
 * Created by snooze on 6/20/16.
 */

var config = require('./config/config');
var mongoose = require('mongoose');
var UserSchema = require('./app/models/user');

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
                        config.hasFacebook = true;
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

        require('./config/passport').setup(passport);
        config.app.use(passport.initialize());
        var routerUsers = require('./app/routes/users');

        config.app.use(config.path, routerUsers);
    } else {
        throw new Error(tag+'Incorrect parameters');
    }
};

/**
 * Escape special characters in the given string of html.
 *
 * @param  {String} html
 * @return {String}
 */
module.exports = {
    setup: doTheThing
};