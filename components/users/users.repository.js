'use strict';

const bcrypt = require('bcrypt')

class UsersRepository {
    constructor(db, pgp) {
        this.db = db;
        this.pgp = pgp;
    }
    async createUser(contextObj) {
        const newUser = contextObj.newUser;
        const existingUser = await this.db.oneOrNone('SELECT * FROM _users WHERE username=$1 OR email=$2', [newUser.username,newUser.email]);
        if (existingUser != null) {
            throw "Existing user";
        }
        let hashedPassword = await bcrypt.hash(newUser.password, 10);
        await this.db.tx(async t => {
            const uid = await t.one('INSERT INTO _users(username,pass,createdate,email) VALUES($1,$2,CURRENT_TIMESTAMP,$3) RETURNING uid',[newUser.username, hashedPassword, newUser.email], a => +a.uid);
            await t.none('INSERT INTO _user_roles(uid,urid) VALUES($1,$2)',[uid,2]) //hardcode urid=2 to not create admin users from api
        })

    }

    async getUserFromDb(contextObj) {
        return this.db.oneOrNone(`SELECT * FROM _users INNER JOIN _user_roles ON _users.uid = _user_roles.uid WHERE username=$1`, [contextObj.user.username]);
    }

    async getUserInfections(contextObj) {
        return this.db.oneOrNone('SELECT * FROM covid_case WHERE uid = $1 ORDER BY createdate DESC LIMIT 1', [contextObj.uid])
    }

    async newCase(contextObj) {
        await this.db.none('INSERT INTO covid_case (uid,createdate) VALUES ($1,$2)',[contextObj.userDetails.uid,contextObj.date])
    }

    async addVisit(contextObj) {
        await this.db.none('INSERT INTO visits (pid,uid,estimation) VALUES($1,$2,$3)',[contextObj.pid,contextObj.uid,contextObj.estimation])
    }

    async editProfile(contextObj){
        if(contextObj.username == null){
            contextObj.username = contextObj.userDetails.username;
        }
        if(contextObj.pass != null){
            contextObj.pass = await bcrypt.hash(contextObj.pass, 10);
        }
        else{
            contextObj.pass = contextObj.userDetails.pass;
        }
        await this.db.none('UPDATE _users SET username = $1, pass = $2 WHERE uid = $3 ',[contextObj.username,contextObj.pass,contextObj.userDetails.uid])
    }

    async getUserInfections(contextObj){
        return await this.db.manyOrNone('SELECT cid AS case_id, uid AS user_id, createdate AS case_date FROM covid_case WHERE uid = $1 ORDER BY case_date DESC',[contextObj.userDetails.uid])
    }

    async getUserVisits(contextObj){
        return await this.db.manyOrNone('SELECT pois.pid AS poi_id, name AS poi_name, address, ST_X(point) AS poi_lon, ST_Y(point) AS poi_lat, vid AS visit_id, uid AS user_id, visits.createdate AS visit_date FROM visits INNER JOIN pois ON pois.pid = visits.pid WHERE uid=$1',[contextObj.userDetails.uid])
    }

    async getUserVisitsTimeframe(contextObj){
        return await this.db.manyOrNone(`SELECT pois.pid AS poi_id, name AS poi_name, address, ST_X(point) AS poi_lon, ST_Y(point) AS poi_lat, vid AS visit_id, uid AS user_id, visits.createdate AS visit_date FROM visits INNER JOIN pois ON pois.pid = visits.pid WHERE uid=$1 AND visits.createdate > (NOW() - INTERVAL '7 days' )`,[contextObj.userDetails.uid])
    }

    async getInfectedContacts(contextObj,pois){
        return await this.db.manyOrNone(`SELECT DISTINCT ON (vid) visits.uid, vid FROM visits INNER JOIN covid_case ON visits.uid=covid_case.uid WHERE (visits.createdate > ($1::timestamp - INTERVAL '2 hours' ) OR visits.createdate < ($1::timestamp - INTERVAL '2 hours' )) AND (covid_case.createdate > (visits.createdate - INTERVAL '7 days' ) OR covid_case.createdate < (visits.createdate - INTERVAL '7 days' ) ) AND visits.uid != $2`,[pois.visit_date,contextObj.userDetails.uid])
    }

    async getTotalVisits(contextObj){
        return await this.db.one('SELECT COUNT(vid) FROM visits');
    }

    async getTotalCases(contextObj){
        return await this.db.one('SELECT COUNT(cid) FROM covid_case');
    }

    async visitsFromCases(contextObj){
        return await this.db.one(`SELECT COUNT(vid) FROM visits RIGHT JOIN covid_case ON visits.uid = covid_case.uid WHERE (visits.createdate<(covid_case.createdate + INTERVAL '14 days') AND visits.createdate>(covid_case.createdate - INTERVAL '7 days')) `)
    }

    async poisCategVisits(contextObj){
        return await this.db.manyOrNone('SELECT pois.pid,name,address,ST_X(point) AS lon,ST_Y(point) AS lat,COUNT(vid) as number_visits FROM pois LEFT JOIN visits ON visits.pid = pois.pid GROUP BY pois.pid ORDER BY number_visits DESC')
    }

    async poisCategVisitsFromCases(contextObj){
        return await this.db.manyOrNone(`SELECT pois.pid,name,address,ST_X(point) AS lon,ST_Y(point) AS lat,COUNT(vid) as number_visits FROM pois LEFT JOIN visits ON visits.pid = pois.pid RIGHT JOIN covid_case ON visits.uid = covid_case.uid WHERE (visits.createdate<(covid_case.createdate + INTERVAL '14 days') AND visits.createdate>(covid_case.createdate - INTERVAL '7 days')) GROUP BY pois.pid ORDER BY number_visits DESC`)
    }

    async getVisitsPerDay(contextObj,visitdate){
        return await this.db.one('SELECT COUNT(vid) FROM visits WHERE createdate::date=$1',[visitdate])
    }

    async getInfectedVisitsPerDay(contextObj,visitdate){
        return await this.db.one(`SELECT COUNT(vid) FROM visits INNER JOIN covid_case ON visits.uid = covid_case.uid WHERE visits.createdate::date=$1 AND (visits.createdate<=(covid_case.createdate + INTERVAL '14 days') AND visits.createdate>(covid_case.createdate - INTERVAL '1 days')) `,[visitdate])
    }

    async getVisitsPerHour(contextObj,visitdate,visithour){
        return await this.db.one('SELECT COUNT(vid) FROM visits WHERE createdate::date=$1 AND extract(hour from createdate) = $2 ',[visitdate,visithour])
    }

    async getInfectedVisitsPerHour(contextObj,visitdate,visithour){
        return await this.db.one(`SELECT COUNT(vid) FROM visits INNER JOIN covid_case ON visits.uid = covid_case.uid WHERE visits.createdate::date=$1 AND extract(hour from visits.createdate) = $2 AND (visits.createdate<=(covid_case.createdate + INTERVAL '14 days') AND visits.createdate>(covid_case.createdate - INTERVAL '1 days')) `,[visitdate,visithour])
    }

}

module.exports = UsersRepository;
