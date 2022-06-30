require("dotenv").config()
const express = require("express")
const bodyParser = require("body-parser")
const uuid = require("uuid").v1
const jwt = require("jsonwebtoken")
const util = require("util")
const cors = require('cors')
const mongoose = require("mongoose")

// utility functions
const jwtToken = require("../model/Token")
const emailHandler = require("../utils/sendEmail")

// import database functions
const User = require("../model/User")

const app = express()

let {
    MONGODB_CONNECTION_URI
} = process.env

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// connect mongoose
mongoose.connect(MONGODB_CONNECTION_URI).then(() => {
    console.log(">>>>>\n\n Successfully connected to MongoDB.\n\n")
})


// Request Logs
app.use((req, res, next) => {
    console.log("====================")
    let date = new Date()
    console.log(`[${date.toLocaleString()}]`)
    console.log(`Requesting: ${req.url}`);
    console.log(`method: ${req.method}`);
    console.log(`path: ${req.path}`);
    console.log('Body Object:');
    console.log(util.inspect(req.body, { depth: null }));
    console.log("====================")
    next();
})

app.get("/", (req, res) => {
    return res.status(200).send("<h1>Hello World!</h1>")
})

app.post("/api/signup", async (req, res) => {
    const { email, username } = req.body
    const userid = uuid()

    await User.createUser({ email: email, username: username, userid: userid }).then(response => {
        return res.status(response.statusCode).json(JSON.parse(response.body))

    }).catch(err => {
        return res.status(err.statusCode).json(JSON.parse(err.body))
    })

})

app.post("/api/login", async (req, res) => {
    const email = req.body.email
    const redirect_url = req.body.redirect_url
    await User.loginUser(email).then(async (response) => {
        if (response.statusCode === 200) {
            let { uuid, email, username } = JSON.parse(response.body).user

            const token_response = await jwtToken.generateToken({
                uuid: uuid,
                username: username
            }, 300, false)
            console.log(`[LOGIN] - ${JSON.stringify(token_response)}`)
            if (token_response.statusCode === 200) {
                await emailHandler.sendEmail({
                    to: email,
                    subject: "Login Attempt Detected",
                    html: `
                <h1>Hi ${username},</h1>
                <p>You have made a login attempt on ${new Date()}.</p>
                <p style="padding:2rem;background-color:lightgray;">Please click on the <strong><a href="${redirect_url}/verify/${JSON.parse(token_response.body).token}">Link</a></strong> to confirm your login.</p>
                <br />
                <br />
                <br />
                <p>If you did not make this request, please ignore this email.<br/>Do reach out to us at contact@kahshin.codes should you have any queries.</p>
                <p>Best Regards,<br/>AuthBot</p>
                `
                })
                return res.status(200).json({
                    message: "Email sent",
                    uuid: uuid,
                })
            }
            else{
                return res.status(token_response.statusCode).json(JSON.parse(token_response.body))
            }
        }

        return res.status(response.statusCode).json(JSON.parse(response.body))
    })

})

app.post("/verify/:token", async (req, res) => {
    const token = req.params.token
    let verified = await jwtToken.decodeToken(token)

    console.log("token", JSON.stringify(verified))

    if (verified.auth) {
        // generate a session token for 3 hours
        const sessionToken = await jwtToken.generateToken({
            uuid: verified.uuid,
            username: verified.username
        }, 10800, true)
        
        let response_obj = sessionToken.body
        response_obj.user = verified.body.decoded.username
        return res.status(sessionToken.statusCode).json(JSON.parse(response_obj))
    }
    else {
        return res.status(verified.statusCode).json({
            message: verified.body.message,
            token: null,
            user: null
        })
    }
})




module.exports = app