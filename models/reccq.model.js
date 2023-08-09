const mongoose = require('mongoose')
const Schema = mongoose.Schema

const reccqSchema = new Schema({
    question  : {type : String , required: true},
    options : [{type : Schema.Types.ObjectId, ref: 'reccOptions'}],
    order : {type : Number}
})

const Reccq = mongoose.model('Reccq', reccqSchema)
module.exports = Reccq