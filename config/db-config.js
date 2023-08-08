'use strict'

const promise = require('bluebird');
const pgPromise = require('pg-promise');
const UsersRepository = require('../components/users/users.repository');
const PoisRepository = require('../components/pois/pois.repository');
const dbUrl = 'postgres://postgres:postgres@localhost:5432/covid19';

const initOptions = {

    // Use a custom promise library, instead of the default ES6 Promise:
    promiseLib: promise,
    // Required in order to mock database during testing
    noLocking : true, 
    // Extending the database protocol
    // API: http://vitaly-t.github.io/pg-promise/global.html#event:extend
    extend(obj, dc) {
        obj.users = new UsersRepository(obj, pgp);
        obj.pois = new PoisRepository(obj, pgp);
    }
};


// Initializing the library:
const pgp = pgPromise(initOptions);

// Creating the database instance:
const db = pgp(dbUrl);

module.exports = {
    pgp: pgp,
    db: db
};