const mongoose = require('mongoose')
const Schema = mongoose.Schema

const reccSchema = new Schema({
    choices  : [{type : String}],
    skills   : [{type : String}]
})

const Recc = mongoose.model('Recc', reccSchema)
module.exports = Recc