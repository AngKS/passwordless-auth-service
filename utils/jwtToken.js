const jwt = require("jsonwebtoken");

module.exports = {

    generateToken: (payload, duration) => {
        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: duration })
    },

    decodeToken: (token) => {
        return jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err){
                return {
                    statusCode: 403,
                    auth: false,
                    body: {
                        message: "Invalid token",
                        decoded: {}
                    }
                }
            }
            else{
                console.log("DECODED", decoded)
                return {
                    statusCode: 200,
                    auth: true,
                    body: {
                        message: "Token verified",
                        decoded: decoded
                    }
                }
            }
        })
    }
} 
