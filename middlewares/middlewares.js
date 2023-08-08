const db = require('../config/db-config').db;
const jwt = require('jsonwebtoken');

async function loggedIn(req, res, next) {
    let jwt_secret = "COVID19";
    if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        jwt.verify(req.headers.authorization.split(' ')[1], jwt_secret, async (err, decode) => {
            const userFromDb = await db.users.getUserFromDb({ user: { username: decode.username } });
            if (err || userFromDb == null) {
                req.user = undefined;
                // return res.status(401)
                //     .json({
                //         status: '401 Fobidden'
                //     });
                    res.redirect('/login')
            }
            req.user = userFromDb;
            next();
        });
    }else if(req.isAuthenticated()){
        const userFromDb = await db.users.getUserFromDb(req.session.passport);
        req.user = userFromDb;
        next();
    }
     else {
        req.user = undefined;
        // return res.status(401)
        //     .json({
        //         status: '401 Fobidden'
        //     });
        res.redirect('/login')
    }
}

async function isAdmin(req, res, next){
    if(req.user.urid == 1){
        next();
    }
    else{
        req.user = undefined;
        req.logout; 
        return res.status(401)
            .json({
                status: '401 Fobidden'
            });
    }
}

module.exports = {
    loggedIn: loggedIn,
    isAdmin: isAdmin
};
