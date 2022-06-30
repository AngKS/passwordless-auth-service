var jwt = require('jsonwebtoken');


function verifyToken(req, res, next) {

    var token = req.headers['authorization']; //retrieve authorization header’s content
    if (!token || !token.includes('Bearer')) { //process the token
        res.status(403).type('application/json');
        res.json({ auth: false, message: 'Not authorized!' });
    } else {
        token = token.split(' ')[1]; //obtain the token’s value
        jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) { //verify token
            if (err) {
                res.status(403).type('application/json');
                res.json({ auth: false, message: 'Not authorized!' });
            } else {
                req.userid = decoded.userid; //decode the userid and store in req for use
                req.email = decoded.email; //decode the role and store in req for use
                next();
            }
        });
    }
}

module.exports = verifyToken;
