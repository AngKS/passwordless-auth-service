const mailer = require("@sendgrid/mail")
require("dotenv").config()

module.exports.sendEmail = async (payload) => {

    mailer.setApiKey(process.env.SENDGRID_API_KEY)

    return await new Promise((resolve, reject) => {

        let message = {
            to: payload.to,
            from: process.env.SENDER_EMAIL,
            subject: payload.subject,
            text: payload.text,
            html: payload.html
        }

        mailer.send(message)
            .then(() => {
                resolve({
                    statusCode: 200,
                    body: JSON.stringify({
                        message: "Email sent"
                    })
                })
            })
            .catch((err) => {
                console.log(err)
                reject({
                    statusCode: 500,
                    body: JSON.stringify({
                        message: "Error sending email"
                    })
            })
        })
    })

}
