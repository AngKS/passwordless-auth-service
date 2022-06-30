const mongoose = require('mongoose')
const codeGenerator = require("../utils/generateRecovery")
const bcrypt = require('bcrypt')
const hashRounds = 10


const UserModel = require("../Schema/UserSchema")

let checkAttempts = (attempts) => {

    let maxAttempt = 3
    let now = +new Date
    let maxDuration = 10 * 60 * 1000 // 10 minutes

    if (attempts.length > maxAttempt) {
        // check the last 3 attempts to see if they are within the last 5 minutes
        let last_5_min_attempts = attempts.filter(attempt => {
            return (now - attempt) < maxDuration
        })
        if (last_5_min_attempts.length >= maxAttempt) {
            return {
                status: true,
                final_attempts: last_5_min_attempts
            }
        }
        else{
            return {
                status: false,
                final_attempts: last_5_min_attempts
            }
        }

    }
    else{
        return {
            status: false,
            final_attempts: attempts
        }
    }
}
        


let User = {

    createUser: ({ email, username, userid }) => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({ email: email }).then((user) => {
                if (user) {
                    return reject({
                        statusCode: 400,
                        body: JSON.stringify({
                            message: "Email already exists"
                        })

                    })
                }
                const recovery_phrase = codeGenerator.generateCode()
                bcrypt.hash(recovery_phrase, hashRounds, (err, hash) => {
                    if (err) {
                        return reject({
                            statusCode: 500,
                            body: JSON.stringify({
                                message: "Error creating user"
                            })
                        })
                    }
                    let newUser = new UserModel({
                        _id: mongoose.Types.ObjectId(),
                        email: email,
                        username: username,
                        userID: userid,
                        recovery_phrase: hash,
                        status: "pending",
                        attempts: 0
                    })

                    console.log("newUser", newUser)

                    newUser.save().then((user) => {
                        console.log("Added user")
                        let { _id, email } = user
                        return resolve({
                            statusCode: 200,
                            body: JSON.stringify({
                                message: "User created",
                                user: {
                                    _id,
                                    email,
                                recovery_phrase: recovery_phrase
                                }
                            })
                        })
                    }).catch((err) => {
                        console.log(`[ERROR] - ${err}`)
                        return reject({
                            statusCode: 500,
                            body: JSON.stringify({
                                message: "Error creating user"
                            })
                        })
                    })
                })
            })
        })

    },

    loginUser: (email) => {

        return new Promise((resolve, reject) => {
            UserModel.findOne({ email: email }).then((user) => {
                if (!user) {
                    return resolve({
                        statusCode: 200,
                        body: JSON.stringify({
                            user: null
                        })
                    })
                }
                else {

                    user.login_count += 1

                    let attempts = [...user.login_attempts]
                    attempts.push(+new Date)
                    // check if the user has reached the max attempts

                    let {status, final_attempts} = checkAttempts(attempts)
                    
                    if (status){
                        user.login_attempts = final_attempts
                        user.save()

                        return resolve({
                            statusCode: 423,
                            body: JSON.stringify({
                                message: "Too many login attempts",
                                user: {}
                            })
                        })
                    }
                    else{
                        user.login_attempts = final_attempts
                        user.save()

                        return resolve({
                            statusCode: 200,
                            body: JSON.stringify({
                                message: "User logged in",
                                user: {
                                    uuid: user.userID,
                                    email: user.email,
                                    username: user.username
                                }
                            })
                        })

                    }


                    
                }

            })
        })
    }
}

module.exports = User