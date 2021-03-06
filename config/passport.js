/**
 * Created by snooze on 6/20/16.
 */

var passport = require('passport');
// load all the things we need
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy  = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var LocalStrategy = require('passport-local').Strategy;

var mongoose = require('mongoose');

var User = mongoose.model('User');

var config = require('./config');

module.exports = {
    setup: function(passport) {

        // used to serialize the user for the session
        passport.serializeUser(function (user, done) {
            done(null, user.id);
        });

        // used to deserialize the user
        passport.deserializeUser(function (id, done) {
            User.findById(id, function (err, user) {
                done(err, user);
            });
        });

        /**
         * Setup LocalStrategy
         */
        passport.use(new LocalStrategy(
            function (username, password, done) {
                User.findOne({'username': username}, function (err, user) {
                    if (err) {
                        return done(err);
                    }
                    if (!user) {
                        return done(null, false, {message: 'Incorrect username.'});
                    }
                    if (!user.validPassword(password)) {
                        return done(null, false, {message: 'Incorrect password.'});
                    }
                    return done(null, user);
                });
            }
        ));

        if (config.hasFacebook) {
            /**
             * Setup FacebookStrategy
             */
            passport.use(new FacebookStrategy({
                    // pull in our app id and secret from our auth.js file
                    clientID: config.FACEBOOK_APPID,
                    clientSecret: config.FACEBOOK_SECRET,
                    callbackURL: config.FACEBOOK_CALLBACK
                },

                // facebook will send back the token and profile
                function (token, refreshToken, profile, done) {
                    if (config.verbose)
                        console.log(config.vtag + '[FACEBOOK] - Strategy called');

                    // asynchronous
                    process.nextTick(function () {

                        // find the user in the database based on their facebook id
                        User.findOne({'facebook.id': profile.id}, function (err, user) {

                            // if there is an error, stop everything and return that
                            // ie an error connecting to the database
                            if (err) {
                                console.log(config.etag + "[FACEBOOK] ++ Error accessing users database: " + err);
                                return done(err);
                            }

                            // if the user is found, then log them in
                            if (user) {
                                if (config.verbose)
                                    console.log(config.vtag + "[FACEBOOK] -- User exists: " + user.facebook.name);
                                return done(null, user); // user found, return that user
                            } else {
                                // if there is no user found with that facebook id, create them
                                var newUser = new User();

                                // set all of the facebook information in our user model
                                newUser.facebook.id = profile.id; // set the users facebook id
                                newUser.facebook.token = token; // we will save the token that facebook provides to the user
                                newUser.facebook.name = profile.displayName; // look at the passport user profile to see how names are returned
                                newUser.username = profile.displayName;
                                if (profile.emails) {
                                    newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
                                }

                                // save our user to the database
                                newUser.save(function (err) {
                                    if (err) {
                                        console.log(config.etag + "[FACEBOOK] ++ Error saving user: " + newUser.facebook.name);
                                        done(err);
                                        console.log(newUser)
                                    } else {
                                        if (config.verbose)
                                            console.log(config.vtag + "[FACEBOOK] -- User saved: " + newUser.facebook.name);

                                        // if successful, return the new user
                                        return done(null, newUser);
                                    }
                                });
                            }

                        });
                    });

                }));
        }


        if (config.hasTwitter) {
            /**
             * Setup Twitter Strategy
             */
            passport.use(new TwitterStrategy({
                    consumerKey: config.TWITTER_KEY,
                    consumerSecret: config.TWITTER_SECRET,
                    callbackURL: config.TWITTER_CALLBACK
                },
                function (token, tokenSecret, profile, done) {
                    if (config.verbose)
                        console.log(config.vtag + '[TWITTER] - Strategy called');

                    // make the code asynchronous
                    // User.findOne won't fire until we have all our data back from Twitter
                    process.nextTick(function () {

                        User.findOne({'twitter.id': profile.id}, function (err, user) {

                            // if there is an error, stop everything and return that
                            // ie an error connecting to the database
                            if (err) {
                                console.log(config.etag + "[TWITTER] ++ Error accessing users database: " + err);
                                return done(err);
                            }


                            // if the user is found then log them in
                            if (user) {
                                if (config.verbose)
                                    console.log(config.vtag + "[TWITTER] -- User exists: " + user.twitter.name);
                                return done(null, user); // user found, return that user
                            } else {
                                // if there is no user, create them
                                var newUser = new User();

                                // set all of the user data that we need
                                newUser.twitter.id = profile.id;
                                newUser.twitter.token = token;
                                newUser.twitter.username = profile.username;
                                newUser.twitter.displayName = profile.displayName;
                                newUser.username = profile.displayName;

                                // save our user into the database
                                newUser.save(function (err) {
                                    if (err) {
                                        console.log(config.etag + "[TWITTER] ++ Error saving user: " + newUser.twitter.username);
                                        done(err);
                                    } else {
                                        if (config.verbose)
                                            console.log(config.vtag + "[TWITTER] -- User saved: " + newUser.twitter.username);

                                        // if successful, return the new user
                                        return done(null, newUser);
                                    }
                                });
                            }
                        });

                    });

                }));
        }


        if (config.hasGoogle) {
            // =========================================================================
            // GOOGLE ==================================================================
            // =========================================================================
            passport.use(new GoogleStrategy({
                    clientID: config.GOOGLE_APPID,
                    clientSecret: config.GOOGLE_SECRET,
                    callbackURL: config.GOOGLE_CALLBACK
                },
                function (token, refreshToken, profile, done) {

                    // make the code asynchronous
                    // User.findOne won't fire until we have all our data back from Google
                    process.nextTick(function () {

                        // try to find the user based on their google id
                        User.findOne({'google.id': profile.id}, function (err, user) {
                            if (err)
                                return done(err);

                            if (user) {

                                // if a user is found, log them in
                                return done(null, user);
                            } else {
                                // if the user isnt in our database, create a new user
                                var newUser = new User();

                                // set all of the relevant information
                                newUser.google.id = profile.id;
                                newUser.google.token = token;
                                newUser.google.name = profile.displayName;
                                newUser.username = profile.displayName;
                                newUser.google.email = profile.emails[0].value; // pull the first email

                                // save the user
                                newUser.save(function (err) {
                                    if (err)
                                        throw err;
                                    return done(null, newUser);
                                });
                            }
                        });
                    });

                }));
        }
    }
};
