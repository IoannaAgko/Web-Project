'use strict';
const passport = require('passport');
const db = require('../../config/db-config').db;
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const dayjs = require('dayjs');


async function createUser(req, res, next) {
    const contextObj = {
        newUser: req.body
    };
    try {
        await db.users.createUser(contextObj);
        return res.status(200)
            .json({
                status: 'success',
                data: "User " + req.body.username + " created successfully"
            });
    } catch (error) {
        console.log(error)
        return res.status(400)
            .json({
                status: 'failure',
                data: {}
            });
    }
};

async function login(req, res, next) {
    passport.authenticate('local', async function (err, user, info) {
        let dbUser;
        let jwt_secret = "COVID19";

        const contextObj = {
            user: user,
        };
        try {
            dbUser = await db.users.getUserFromDb(contextObj);
        } catch (error) {
            console.log('Error: ', error);
        }
        if (dbUser && bcrypt.compareSync(user.pass, dbUser.pass)) {
            dbUser.userpass = undefined;

            const options = {
                expiresIn: '1h',//https://github.com/auth0/node-jsonwebtoken
            };

            jwt.sign(dbUser, jwt_secret, options, function (err, encoded) {
                dbUser.token = encoded;
                req.login(user, function(err) {
                    req.user = dbUser;
                  });
                return res.status(200).json({
                    status: 'success',
                    data: dbUser,
                    message: '',
                });
            });
        } else {
            return res.status(401).json({
                status: 'warning',
                message: 'wrong credentials',
            });
        }
    })(req, res, next);
};

async function newCase(req, res, next) {

    const contextObj = {
        userDetails: req.user,
        date: req.query.date
        //uid: req.body.uid
    };

    try {
        let already_infected = false;
        const pastInfections = await db.users.getUserInfections(contextObj)
        if(pastInfections.length != 0){
            let pastDate = dayjs(pastInfections[0].case_date);
            //let currentDate = dayjs()
            let infectionDate = dayjs(contextObj.date)
            let diff = infectionDate.diff(pastDate, 'day')
            if(diff <= 14 && diff>-1){
                already_infected = true
            }
        }

        if(already_infected){
            return res.status(409)
            .json({
                status: 'failure',
                data: {},
                message: 'You have already registered your infection'
            });
        }
        await db.users.newCase(contextObj);
        return res.status(200)
            .json({
                status: 'success',
                data: {},
                message: ''
            });
    } catch (error) {
        console.log(error)
        return res.status(400)
            .json({
                status: 'failure',
                data: {},
                message: ''
            });
    }
};

async function addVisit(req, res, next) {

    const contextObj = {
        user: req.user,
        uid: req.user.uid,
        //uid: req.body.uid,
        pid: req.body.pid,
        estimation: req.body.estimation
    };
    try {
        await db.users.addVisit(contextObj);
        return res.status(200)
            .json({
                status: 'success',
                data: {},
                message: ''
            });
    } catch (error) {
        console.log(error)
        return res.status(400)
            .json({
                status: 'failure',
                data: {},
                message: ''
            });
    }
};

async function editProfile(req, res, next) {
    const contextObj = {
        username: req.body.username,
        pass: req.body.pass,
        userDetails: req.user
    };
    try {
        await db.users.editProfile(contextObj);
        req.logout();
        return res.status(200)
            .json({
                status: 'success',
                data: "Profile edited successfully, please log in again"
            });
    } catch (error) {
        console.log(error)
        return res.status(400)
            .json({
                status: 'failure',
                data: {}
            });
    }
};

async function getStats(req, res, next) {
    const contextObj = {
        userDetails: req.user
    };
    try {
        let stats = new Object();
        stats.infections = await db.users.getUserInfections(contextObj);
        stats.visits = await db.users.getUserVisits(contextObj);
        return res.status(200)
            .json({
                status: 'success',
                data: stats
            });
    } catch (error) {
        console.log(error)
        return res.status(400)
            .json({
                status: 'failure',
                data: {}
            });
    }
};

async function contactTrace(req, res, next) {
    const contextObj = {
        userDetails: req.user
    };
    try {
        let userVisits = await db.users.getUserVisitsTimeframe(contextObj)
        let placesWithContact = new Array();
        for(let x of userVisits){
            let infectedContacts = await db.users.getInfectedContacts(contextObj,x)
            if(infectedContacts.length != 0){
                placesWithContact.push(x)
            }
        }
        return res.status(200)
            .json({
                status: 'success',
                data: placesWithContact
            });
    } catch (error) {
        console.log(error)
        return res.status(400)
            .json({
                status: 'failure',
                data: {}
            });
    }
};

async function totalStats(req, res, next) {
    const contextObj = {
        userDetails: req.user
    };
    try {
        let stats = new Object();
        let totalVisits = await db.users.getTotalVisits(contextObj);
        let totalCases = await db.users.getTotalCases(contextObj);
        let visitsFromCases = await db.users.visitsFromCases(contextObj);
        let poisCategVisits = await db.users.poisCategVisits(contextObj);
        let poisCategVisitsFromCases = await db.users.poisCategVisitsFromCases(contextObj);
        stats.totalVisits = totalVisits.count;
        stats.totalCases = totalCases.count;
        stats.visitsFromCases = visitsFromCases.count;
        stats.poisCategVisits = poisCategVisits;
        stats.poisCategVisitsFromCases = poisCategVisitsFromCases;
        return res.status(200)
            .json({
                status: 'success',
                data: stats
            });
    } catch (error) {
        console.log(error)
        return res.status(400)
            .json({
                status: 'failure',
                data: {}
            });
    }
};

async function visitsperday(req, res, next) {
    const contextObj = {
        userDetails: req.user,
        startDate: req.query.startDate,
        endDate: req.query.endDate
    };
    try {
        let stats = new Object();
        stats.visitsPerDay = new Object();
        stats.infectedVisitsPerDay = new Object();
        let startDate = new Date(contextObj.startDate);
        let endDate = new Date(contextObj.endDate);
        let dateArray = new Array();
        while(startDate <= endDate){
            dateArray.push(startDate);
            let count = await db.users.getVisitsPerDay(contextObj,startDate)
            stats.visitsPerDay[startDate.toISOString().slice(0,10)] = count.count; //Get timestamp without time
            let countInfected = await db.users.getInfectedVisitsPerDay(contextObj,startDate);
            stats.infectedVisitsPerDay[startDate.toISOString().slice(0,10)] = countInfected.count; 
            startDate.setDate(startDate.getDate() +1);
        }
        //console.log(endDate)
        return res.status(200)
            .json({
                status: 'success',
                data: stats
            });
    } catch (error) {
        console.log(error)
        return res.status(400)
            .json({
                status: 'failure',
                data: {}
            });
    }
};

async function visitsperhour(req, res, next) {
    const contextObj = {
        userDetails: req.user,
        date: req.query.date
    };
    try {
        let stats = new Object();
        stats.visitsPerHour = new Object();
        stats.infectedVisitsPerHour = new Object();
        let date = new Date(contextObj.date);
        date.setDate(date.getDate() - 1);//quick fx for date
        for (let i = 0; i < 24; i++) {
            let hour = date.toISOString().slice(11, 13) //for query
            let count = await db.users.getVisitsPerHour(contextObj, date, hour)
            stats.visitsPerHour[date.toISOString().slice(11, 16)] = count.count;
            let countInfected = await db.users.getInfectedVisitsPerHour(contextObj, date, hour);
            stats.infectedVisitsPerHour[date.toISOString().slice(11, 16)] = countInfected.count;
            date.setHours(date.getHours() + 1);
        }
        return res.status(200)
            .json({
                status: 'success',
                data: stats
            });
    } catch (error) {
        console.log(error)
        return res.status(400)
            .json({
                status: 'failure',
                data: {}
            });
    }
};


module.exports = {
    createUser: createUser,
    login: login,
    newCase: newCase,
    addVisit: addVisit,
    editProfile: editProfile,
    getStats: getStats,
    contactTrace: contactTrace,
    totalStats: totalStats,
    visitsperday: visitsperday,
    visitsperhour: visitsperhour
};
