'use strict';
const express = require('express');
const { loggedIn } = require('../../middlewares/middlewares');
const router = express.Router();
const middlewares = require('../../middlewares/middlewares');
let controller = require('./users.controller');

router
    .post('/login', controller.login)
    .post('/create', controller.createUser)
    .post('/case', middlewares.loggedIn, controller.newCase)
    .post('/visit', middlewares.loggedIn, controller.addVisit)
    .post('/edit', middlewares.loggedIn, controller.editProfile)
    .get('/stats', middlewares.loggedIn, controller.getStats)
    .get('/trace', middlewares.loggedIn, controller.contactTrace)
    .get('/totalstats', middlewares.loggedIn, middlewares.isAdmin, controller.totalStats)
    .get('/visitsperday', middlewares.loggedIn, middlewares.isAdmin, controller.visitsperday)
    .get('/visitsperhour', middlewares.loggedIn, middlewares.isAdmin, controller.visitsperhour)

module.exports = router;
