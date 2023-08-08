'use strict';
const express = require('express');
const router = express.Router();
const middlewares = require('../../middlewares/middlewares');
let controller = require('./fe.controller');

router
    .get('/login', controller.feLogin)
    .get('/register', controller.feRegister)
    .get('/continue', controller.feContinue)
    .get('/dashboard', middlewares.loggedIn, controller.feDashboard)
    .get('/ustats', middlewares.loggedIn, controller.ustats)
    .get('/', controller.feHome)
    .get('/profile', middlewares.loggedIn, controller.feprofile)
    .get('/covidCase', middlewares.loggedIn, controller.fecovidCase)
    .get('/admin', middlewares.loggedIn, middlewares.isAdmin, controller.adminDashboard)
    .get('/basicInfos', middlewares.loggedIn, middlewares.isAdmin, controller.basicInfos)
    .get('/perhour', middlewares.loggedIn, middlewares.isAdmin, controller.perhour)
    .get('/perday', middlewares.loggedIn, middlewares.isAdmin, controller.perday)
    .get('/editpois', middlewares.loggedIn, middlewares.isAdmin, controller.editpois)
    .get('/logout', controller.logout)
module.exports = router;