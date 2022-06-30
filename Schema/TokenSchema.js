const mongoose = require('mongoose')

mongoose.Promise = global.Promise

const TokenSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    token: {
        type: String,
        required: true,
    },
    duration: {
        type: String,
        required: true,
    },
    expiry: {
        type: String,
        required: true,
    },
    refresh_token: {
        type: String,
        required: false,
        default: null,
    },
    created_at: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Tokens', TokenSchema)