'use strict';

const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const session = require('express-session');
const fileUpload = require('express-fileupload')
const cors = require('cors');
const middlewares = require('./middlewares/middlewares');
const passport_strategies = require('./config/passport_strategies');


const users = require('./components/users/users.api');
const pois = require('./components/pois/pois.api');
const fe = require('./components/fe/fe.router');

const app = express();
app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json({ limit: '300mb' }));

app.use(session({
    secret: 'usersession',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 3600000 //expire in one hour
    }
}))
app.use(passport.initialize());
app.use(passport.session());

passport_strategies();
app.use(fileUpload());
app.use('/api/users', users);
app.use('/api/pois', pois);
app.use('/', fe)

app.use(express.static('./components/fe'))

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = err;

    // render the error page
    return res.status(err.status || 500);
});


module.exports = app;
