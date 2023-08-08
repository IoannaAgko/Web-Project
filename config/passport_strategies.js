const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

module.exports = function () {

    // serialize and deserialize
    passport.serializeUser(function (user, done) {
        done(null, user);
    });
    passport.deserializeUser(function (obj, done) {
        done(null, obj);
    });


    passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'pass',
        passReqToCallback: true
    },
        function (req, x, y, done) {
            return done(null, {
                username: req.body.username,
                pass: req.body.pass
            });
        }
    ));
};
