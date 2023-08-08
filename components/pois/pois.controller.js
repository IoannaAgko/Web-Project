'use strict';
const db = require('../../config/db-config').db;

function transformHours(hour){
    if(hour < 10){
        hour = "0" + hour;
    }
    hour = '"' + hour + ":00" + '"'
    return hour;
}

async function uploadPois(req, res, next) {
    const file = req.files.pois.data;
    const fileString = file.toString('utf8');
    const fileObj = JSON.parse(fileString);
    let dateModif = new Date(req.body.modifDate)

    let pois = new Array();
    let poi_timeobjects = new Array();
    for(let x of fileObj){
        let postgispoint = { 
            type: 'Point', 
            coordinates: [x.coordinates.lng,x.coordinates.lat],
            crs: { type: 'name', properties: { name: 'EPSG:4326'} }
          };
        let poiObject = {
            pid: x.id,
            name: x.name,
            address: x.address,
            point: postgispoint,
            times: x.populartimes,
            createdate: dateModif
        }
        pois.push(poiObject)
        for(let y of x.populartimes){
            let did;
            if(y.name == "Monday"){did = 1}
            else if(y.name == "Tuesday"){did = 2}
            else if(y.name == "Wednesday"){did = 3}
            else if(y.name == "Thursday"){did = 4}
            else if(y.name == "Friday"){did = 5}
            else if(y.name == "Saturday"){did = 6}
            else if(y.name == "Sunday"){did = 7}
            let poi_timesObject = {
                pid: x.id,
                did: did,
                t00: y.data[0],//must be javascript variable so t0 instead of 00:00 etc
                t01: y.data[1],
                t02: y.data[2],
                t03: y.data[3],
                t04: y.data[4],
                t05: y.data[5],
                t06: y.data[6],
                t07: y.data[7],
                t08: y.data[8],
                t09: y.data[9],
                t10: y.data[10],
                t11: y.data[11],
                t12: y.data[12],
                t13: y.data[13],
                t14: y.data[14],
                t15: y.data[15],
                t16: y.data[16],
                t17: y.data[17],
                t18: y.data[18],
                t19: y.data[19],
                t20: y.data[20],
                t21: y.data[21],
                t22: y.data[22],
                t23: y.data[23],

            }
            poi_timeobjects.push(poi_timesObject);
        }
    }
    const contextObj = {
        pois: pois,
        poi_timeobjects: poi_timeobjects
    }


    try {
        await db.pois.uploadPois(contextObj);
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

async function searchPois(req, res, next) {

    const contextObj = {
        user: req.user,
        name: req.params.name,
        lat: req.query.lat,
        lon: req.query.lon
    };

    try {
        const date = new Date();
        let day = date.getDay();
        if(day==0){day=7}//fix for sunday
        let hour = date.getHours();
        let currenthour = transformHours(hour)
        let afterOneHour = transformHours(hour+1)
        let afterTwoHours = transformHours(hour +2)
        contextObj.afterOneHour = afterOneHour;
        contextObj.afterTwoHours = afterTwoHours;
        contextObj.day = day;
        const pois = await db.pois.searchPois(contextObj);
        for(let x of pois){
            const visitEstimation = await db.pois.visitEstimation(contextObj,x.pid);
            let visitPercentage = 0;
            for(let y in visitEstimation){
                visitPercentage += visitEstimation[y]
            }
            visitPercentage = visitPercentage/2;//to get average
            x.visitPercentage = visitPercentage;
            const averageNumberOfVisits = await db.pois.averageNumberOfVisits(contextObj,x.pid);
            x.averageNumberOfVisits = parseInt(averageNumberOfVisits.avg);
        }
        return res.status(200)
            .json({
                status: 'success',
                data: pois,
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

async function deletePois(req, res, next) {
    const contextObj = {
        userDetails: req.user
    };
    try {
        await db.pois.deletePois(contextObj)
        return res.status(200)
            .json({
                status: 'success',
                data: {}
            });
    } catch (error) {
        console.log(error)
        return res.status(400)
            .json({
                status: 'failure',
                data: {}
            });
    }
}

module.exports = {
    uploadPois: uploadPois,
    searchPois: searchPois,
    deletePois: deletePois
};
