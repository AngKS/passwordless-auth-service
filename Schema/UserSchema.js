const mongoose = require('mongoose');

mongoose.Promise = global.Promise

const UserSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    userID: {
        type: String,
        required: true,
    },
    login_count: {
        type: Number,
        default: 0,
    },
    login_attempts: {
        type: Object,
        default: []
    },
    status: {
        type: String,
        required: true,
    },
    created_on: {
        type: Date,
        default: `${+new Date}`,
    },
    recovery_phrase: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('User', UserSchema)