/**
 * Created by snooze on 6/20/16.
 */

var scapegoat = require('./deleteme/index');

var config = require('./config');
var mongoose = require('mongoose');
var passport = require('passport');
require('./models/user');
require('./config/passport');

// app.use(passport.initialize());
var routerUsers = require('./routes/users');

var doTheThing = function (app, path, mongoUrl, secret, verbose, tag) {

    verbose = verbose || true;
    tag = tag || '[DEBUG] - ';

    if (!app || !path || !mongoUrl || !secret)
        throw new Error(tag+'Incorrect parameters');
    else
        config.secretKey = secret;

    if (verbose) {
        console.log(tag + 'Setup called - Path: ' + path + ' - MongoURL: ' + mongoUrl.toString());
        console.log(tag + 'Secret: ' + secret);
    }
    

    mongoose.connect(mongoUrl);
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        // we're connected!
        if (verbose)
            console.log(tag+"Connected correctly to server");
    });

    app.use(path, routerUsers);
};

/**
 * Escape special characters in the given string of html.
 *
 * @param  {String} html
 * @return {String}
 */
module.exports = {
    escape: scapegoat.escape,
    unescape: scapegoat.unescape,
    hello: scapegoat.hello,

    router: routerUsers,
    passport: passport,
    setup: doTheThing
};