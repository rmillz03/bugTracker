const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
    projID: {
        type: String,
        index: {unique: true},
        required: true
    },
    title: { 
        type: String 
    },
    description: {
        type: String
    },
    status: {
        type: String
    },
    startDate: {
        type: String
        },
    compDate: {
        type: String
    },
    creator: {
        type: String
    }
})

module.exports = mongoose.model('Projects', projectSchema)