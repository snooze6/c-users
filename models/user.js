/**
 * Created by snooze on 6/20/16.
 */

var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var config = require('../config');
var sanitizerPlugin = require('mongoose-sanitizer');

var UserSchema = new mongoose.Schema(
    {
        username: {type: String, lowercase: true, unique: true},
        OauthId: String,
        OauthToken: String,
        hash: String,
        salt: String,

        admin:   {
            type: Boolean,
            default: false
        }
    },{
        timestamps: true,
        versionKey: false
    }
);
UserSchema.plugin(sanitizerPlugin);

/**
 * The pbkdf2Sync() function takes four parameters: password, salt, iterations, and key length. We'll need to make sure
 * the iterations and key length in our setPassword() method match the ones in our validPassword() method
 * @param password
 */
UserSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
};

UserSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
    return this.hash === hash;
};

UserSchema.methods.generateJWT = function() {
    // set expiration to 15 days
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 15);

    // console.log('[DEBUG] - Generating token with secret: '+config.secretKey);

    return jwt.sign({
        _id: this._id,
        username: this.username,
        exp: parseInt(exp.getTime() / 1000),
        admin: this.admin
    }, config.secretKey);
};

module.exports = mongoose.model('User', UserSchema);