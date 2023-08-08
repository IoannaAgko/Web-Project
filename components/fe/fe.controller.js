'use strict';

function login(req, res, next){
    res.sendFile(__dirname + "/html/login.html");
}

function register(req, res, next){
    res.sendFile(__dirname + "/html/signup.html");
}

function feContinue(req, res, next){
    res.sendFile(__dirname + "/html/continue.html");
}

function feDashboard(req, res, next){
    res.sendFile(__dirname + "/html/dashboard-user.html");
}

function feHome(req, res, next){
    res.redirect("/login");
}

function profile(req, res, next){
    res.sendFile(__dirname+ "/html/profile.html")
}

function covidCase(req, res, next){
    res.sendFile(__dirname+ "/html/covidCase.html")
}

function adminDashboard(req, res, next){
    res.sendFile(__dirname + "/html/dashboard-admin.html");
}

function basicInfos(req, res, next){
    res.sendFile(__dirname + "/html/basicInfos.html");
}

function perhour(req, res, next){
    res.sendFile(__dirname + "/html/statsPerHour.html");
}

function perday(req, res, next){
    res.sendFile(__dirname + "/html/statsPerDay.html");
}

function editpois(req, res, next){
    res.sendFile(__dirname + "/html/editPois.html");
}

function ustats(req, res, next){
    res.sendFile(__dirname + "/html/ustats.html");
}

async function logout(req,res,next){
    req.session.destroy;
    res.clearCookie('connect.sid', {path: '/'}) //Clear cookie from client
    req.logout;
    res.redirect('dashboard')
}
module.exports = {
    feLogin: login,
    feRegister: register,
    feContinue: feContinue,
    feDashboard: feDashboard,
    feHome: feHome,
    feprofile: profile,
    fecovidCase: covidCase,
    adminDashboard: adminDashboard,
    basicInfos: basicInfos,
    perhour: perhour,
    perday: perday,
    editpois: editpois,
    ustats: ustats,
    logout: logout
};