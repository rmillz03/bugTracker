const mongoose = require('mongoose')

const projDevSchema = new mongoose.Schema({
projDevID: {
    type: Number,
    index: { unique: true}
},
developer: {
    type: String
},
assignedProj: {
    type: Number
},
role: {
    type: String
}
})

module.exports = mongoose.model('ProjectDevs', projDevSchema)