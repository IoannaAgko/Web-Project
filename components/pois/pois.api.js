'use strict';
const express = require('express');
const router = express.Router();
const middlewares = require('../../middlewares/middlewares');
let controller = require('./pois.controller');

router
    .delete('/', middlewares.loggedIn, middlewares.isAdmin, controller.deletePois)
    .post('/upload', middlewares.loggedIn, middlewares.isAdmin, controller.uploadPois)
    .get('/search/:name', middlewares.loggedIn, controller.searchPois)

module.exports = router;