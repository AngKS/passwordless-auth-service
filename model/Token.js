const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const hashRounds = 10

const TokenModel = require("../Schema/TokenSchema")

let Token = {
    generateToken: (payload, duration, refresh_token) => {
        return new Promise((resolve, reject) => {
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: duration })
            const expiry = new Date().getTime() + duration
            let r_token = refresh_token ? jwt.sign(token.substring(0, 20), process.env.JWT_SECRET) : null
            bcrypt.hash(token, hashRounds, (err, hash) => {
                if (err) {
                    return resolve({
                        statusCode: 500,
                        body: JSON.stringify({
                            message: "Error creating token",
                            token: null
                        })
                    })
                }
                else {
                    const newToken = new TokenModel({
                        _id: mongoose.Types.ObjectId(),
                        token: hash,
                        duration: duration,
                        expiry: expiry,
                        refresh_token: r_token,
                        created_at: +new Date
                    })
                    newToken.save().then(() => {
                        return resolve({
                            statusCode: 200,
                            body: JSON.stringify({
                                message: "Token created",
                                token: token,
                                expiry: expiry,
                                refresh_token: r_token
                            })

                        })
                    }).catch(() => {
                        return resolve({
                            statusCode: 500,
                            body: JSON.stringify({
                                message: "Error creating token",
                                token: null
                            })
                        })
                    })


                }
            })





        })
    },

    decodeToken: (token) => {
        return new Promise((resolve, reject) => {
            return jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    return resolve({
                        statusCode: 403,
                        auth: false,
                        body: {
                            message: "Invalid token",
                            decoded: {}
                        }
                    })
                }
                else {
                    return resolve({
                        statusCode: 200,
                        auth: true,
                        body: {
                            message: "Token verified",
                            decoded: decoded
                        }
                    })
                }
            })
        })

    },
    // refresh_session_token: (refresh_token) => {
    //     return new Promise((resolve, reject) => {

    //         // Check if refresh token is valid
    //         TokenModel.findOne({ refresh_token: refresh_token }).then((token) => {
    //             if (!token) {
    //                 return resolve({
    //                     statusCode: 403,
    //                     body: JSON.stringify({
    //                         message: "Invalid refresh token",
    //                         token: null
    //                     })
    //                 })
    //             }
    //             else{
    //                 // create a new token
    //                 this.generateToken({uuid: token.decoded.uuid})
    //             }
    //     })
    // }


}

module.exports = Token