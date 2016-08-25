/**
 * Created by snooze on 6/20/16.
 */

var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var config = require('../../config/config');
var sanitizerPlugin = require('mongoose-sanitizer');
var mongoosePaginate = require('mongoose-paginate');

module.exports = {
    setup: function (model) {
        var UserSchema;
        if (model) {
            UserSchema = new mongoose.Schema(
                {
                    username: {type: String, lowercase: true, unique: true, required: true},

                    local: {
                        password: String,
                        email: String
                    },
                    facebook: {
                        id: String,
                        token: String,
                        email: String,
                        name: String
                    },
                    twitter: {
                        id: String,
                        token: String,
                        displayName: String,
                        username: String
                    },
                    google: {
                        id: String,
                        token: String,
                        email: String,
                        name: String
                    },
                    admin: {
                        type: Boolean,
                        default: false
                    },
                    data: model
                }, {
                    timestamps: true,
                    versionKey: false
                }
            );
        } else {
            UserSchema = new mongoose.Schema(
                {
                    username: {type: String, lowercase: true, unique : true, required : true},

                    local            : {
                        password: String,
                        email: String
                    },
                    facebook         : {
                        id           : String,
                        token        : String,
                        email        : String,
                        name         : String
                    },
                    twitter          : {
                        id           : String,
                        token        : String,
                        displayName  : String,
                        username     : String
                    },
                    google           : {
                        id           : String,
                        token        : String,
                        email        : String,
                        name         : String
                    },
                    admin:   {
                        type: Boolean,
                        default: false
                    }
                },{
                    timestamps: true,
                    versionKey: false
                }
            );
        }
        UserSchema.plugin(sanitizerPlugin);
        UserSchema.plugin(mongoosePaginate);

        // methods ======================
        // generating a password
        UserSchema.methods.setPassword = function(password) {
            this.local.password =  bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
        };

        // checking if password is valid
        UserSchema.methods.validPassword = function(password) {
            return bcrypt.compareSync(password, this.local.password);
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

        return UserSchema
    }
};
