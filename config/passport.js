/**
 * Created by snooze on 6/20/16.
 */

var passport = require('passport');
// load all the things we need
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy  = require('passport-twitter').Strategy;
var LocalStrategy = require('passport-local').Strategy;

var mongoose = require('mongoose');

var User = mongoose.model('User');

var config = require('./config');

module.exports = function(passport) {

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    /**
     * Setup LocalStrategy
     */
    passport.use(new LocalStrategy(
        function(username, password, done) {
            User.findOne({ username: username }, function (err, user) {
                if (err) { return done(err); }
                if (!user) {
                    return done(null, false, { message: 'Incorrect username.' });
                }
                if (!user.validPassword(password)) {
                    return done(null, false, { message: 'Incorrect password.' });
                }
                return done(null, user);
            });
        }
    ));

    // code for login (use('local-login', new LocalStategy))
    // code for signup (use('local-signup', new LocalStategy))
    // code for facebook (use('facebook', new FacebookStrategy))

    /**
     * Setup Twitter Strategy
     */
    passport.use(new TwitterStrategy({
            consumerKey     : config.TWITTER_KEY,
            consumerSecret  : config.TWITTER_SECRET,
            callbackURL     : config.TWITTER_CALLBACK
        },
        function(token, tokenSecret, profile, done) {

            // make the code asynchronous
            // User.findOne won't fire until we have all our data back from Twitter
            process.nextTick(function() {

                User.findOne({ 'twitter.id' : profile.id }, function(err, user) {

                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database
                    if (err)
                        return done(err);

                    // if the user is found then log them in
                    if (user) {
                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user, create them
                        var newUser                 = new User();

                        // set all of the user data that we need
                        newUser.twitter.id          = profile.id;
                        newUser.twitter.token       = token;
                        newUser.twitter.username    = profile.username;
                        newUser.twitter.displayName = profile.displayName;

                        // save our user into the database
                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });

            });

        }));

};
