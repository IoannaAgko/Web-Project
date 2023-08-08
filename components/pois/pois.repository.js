'use strict';

const bcrypt = require('bcrypt')

class PoisRepository {
    constructor(db, pgp) {
        this.db = db;
        this.pgp = pgp;
    }

    async uploadPois(contextObj) {
        const cs_pois = new this.pgp.helpers.ColumnSet(['pid', 'name', 'address', 'point','createdate'], { table: 'pois' });
        const onConflict_pois = ' ON CONFLICT(pid) DO UPDATE SET ' + cs_pois.assignColumns({from: 'EXCLUDED', skip: ['pid']});
        const cs_poi_timeobjects = new this.pgp.helpers.ColumnSet(['pid', 'did', {name:'00:00',prop: "t00"}, {name:'01:00',prop: "t01"},{name:'02:00',prop: "t02"},{name:'03:00',prop: "t03"},{name:'04:00',prop: "t04"},{name:'05:00',prop: "t05"},{name:'06:00',prop: "t06"},{name:'07:00',prop: "t07"},{name:'08:00',prop: "t08"},{name:'09:00',prop: "t09"},{name:'10:00',prop: "t10"},{name:'11:00',prop: "t11"},{name:'12:00',prop: "t12"},{name:'13:00',prop: "t13"},{name:'14:00',prop: "t14"},{name:'15:00',prop: "t15"},{name:'16:00',prop: "t16"},{name:'17:00',prop: "t17"},{name:'18:00',prop: "t18"},{name:'19:00',prop: "t19"},{name:'20:00',prop: "t20"},{name:'21:00',prop: "t21"},{name:'22:00',prop: "t22"},{name:'23:00',prop: "t23"}], { table: 'pois_populartimes' });
        const onConflict_timeobjects = ' ON CONFLICT(pid,did) DO UPDATE SET ' +cs_poi_timeobjects.assignColumns({from: 'EXCLUDED', skip: ['pid','did']});
        await this.db.tx(async t => {
            const poisQueryText = this.pgp.helpers.insert(contextObj.pois, cs_pois) + onConflict_pois;
            await t.none(poisQueryText)
            const poi_timeobjectsText = this.pgp.helpers.insert(contextObj.poi_timeobjects, cs_poi_timeobjects) + onConflict_timeobjects;
            await t.none(poi_timeobjectsText)
        })
    }

    async searchPois(contextObj) {
        contextObj.name = contextObj.name.toLowerCase();
        let radius = 5000;
        let searchQuery = `SELECT pid,name,address,ST_X(point) AS lon,ST_Y(point) AS lat FROM pois WHERE ST_DWithin(point, ST_MakePoint(` + contextObj.lon + `,` + contextObj.lat + `)::geography,`+ radius +`) AND LOWER(name) LIKE ` +` '%` + contextObj.name +`%' `
        return await this.db.manyOrNone(searchQuery)
    }

    async visitEstimation(contextObj,pid){
        let estimationQuery = 'SELECT ' + contextObj.afterOneHour + ',' + contextObj.afterTwoHours + ' FROM pois_populartimes WHERE pid =' + "'" + pid + "'" + ' AND did=' + contextObj.day;
        let estimation = await this.db.oneOrNone(estimationQuery);
        return estimation;
    }
    async averageNumberOfVisits(contextObj,pid){
        let averageVisits = await this.db.oneOrNone(`SELECT AVG(estimation) FROM visits WHERE pid = $1 AND createdate > (NOW() - INTERVAL '2 hours' )`,[pid])
        return averageVisits;
    }
    async deletePois(contextObj){
        await this.db.tx(async t => {
            await t.none('DELETE FROM visits');
            await t.none('DELETE FROM pois_populartimes');
            await t.none('DELETE FROM pois')
        })
    }
}

module.exports = PoisRepository;