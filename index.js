/**
 * Created by snooze on 6/20/16.
 */

var config = require('./config/config');
var mongoose = require('mongoose');
var UserSchema = require('./app/models/user');

var passport = require('passport');

function parseargs(app, path, mongoUrl, secret, verbose, tag){
    config.verbose = verbose || true;
    config.vtag = tag || '[DEBUG] -- ';

    if (path) {
        config.path = path;
        if (mongoUrl) {
            config.mongoUrl = mongoUrl;
            if (app) {
                config.app = app;
                if (secret.SECRET) {
                    config.secretKey = secret.SECRET;

                    if (secret.FACEBOOK_APPID && secret.FACEBOOK_SECRET) {
                        config.hasFacebook = true;
                        config.FACEBOOK_APPID = secret.FACEBOOK_APPID;
                        config.FACEBOOK_SECRET = secret.FACEBOOK_SECRET;
                        if (verbose) {
                            console.log(tag + 'Facebook support configured [APPID: ' + config.FACEBOOK_APPID + '] - [SECRET: ' + config.FACEBOOK_SECRET + ']');
                        }
                    } else {
                        if (verbose)
                            console.log(config.wtag + 'Facebook support not configured');
                    }

                    if (secret.TWITTER_KEY && secret.TWITTER_SECRET) {
                        config.hasFacebook = true;
                        config.TWITTER_KEY = secret.TWITTER_KEY;
                        config.TWITTER_SECRET = secret.TWITTER_SECRET;
                        if (verbose) {
                            console.log(tag + 'Twitter support configured [APPID: ' + config.TWITTER_KEY + '] - [SECRET: ' + config.TWITTER_SECRET + ']');
                        }
                    } else {
                        if (verbose)
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

var doTheThing = function (app, path, mongoUrl, secret, verbose, tag) {
    if (parseargs(app, path, mongoUrl, secret, verbose, tag)){
        if (verbose) {
            console.log(tag + 'Setup called - Path: ' + path + ' - MongoURL: ' + mongoUrl.toString());;
        }

        app.use(passport.initialize());

        mongoose.connect(mongoUrl);
        var db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function () {
            // we're connected!
            if (verbose)
                console.log(tag+"Connected correctly to server");
        });

        require('./config/passport')(passport);

        var routerUsers = require('./app/routes/users');

        app.use(path, routerUsers);
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