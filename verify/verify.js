/**
 * Created by snooze on 6/20/16.
 */

var config = require('../config');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var User = require('../models/user');

exports.getToken = function (user) {
    return jwt.sign(user, config.secretKey, {
        expiresIn: 3600
    });
};

exports.verifyOrdinaryUser = function (req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, config.secretKey, function (err, decoded) {
            if (err) {
                var err = new Error('You are not authenticated!');
                err.status = 401;
                return next(err);
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                return next();
            }
        });
    } else {
        // if there is no token
        // return an error
        var err = new Error('No token provided!');
        err.status = 403;
        return next(err);
    }
};

exports.verifyAdminUser = function (req, res, next) {
    console.log(req.decoded);
    if(req.decoded._doc && req.decoded._doc.admin && (req.decoded._doc.admin==true))  {
        return next();
    }else {
        var err = new Error('You have no privileges!');
        err.status = 401;
        return next(err);
    }
    // return this.verifyOrdinaryUser(req, res, next);
    //
    // // check header or url parameters or post parameters for token
    // var token = req.body.token || req.query.token || req.headers['x-access-token'];
    //
    // // decode token
    // if (token) {
    //     // verifies secret and checks exp
    //     jwt.verify(token, config.secretKey, function (err, decoded) {
    //         if (err) {
    //             var err = new Error('You are not authenticated!');
    //             err.status = 401;
    //             return next(err);
    //         } else {
    //             // if everything is good, save to request for use in other routes
    //             // console.log(decoded);
    //             // console.log("User is "+decoded._doc.admin);
    //             if (decoded._doc.admin) {
    //                 req.decoded = decoded;
    //                 next();
    //             } else {
    //                 var err = new Error('User is not an admin!');
    //                 err.status = 403;
    //                 return next(err);
    //             }
    //         }
    //     });
    // } else {
    //     // if there is no token
    //     // return an error
    //     var err = new Error('No token provided!');
    //     err.status = 403;
    //     return next(err);
    // }
};

// exports.auth = jwt({secret: config.secretKey, userProperty: 'payload'});
exports.auth = function (req, res, next) {
    next();
}