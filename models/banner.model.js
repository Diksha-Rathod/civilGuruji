const mongoose = require('mongoose')
const Schema = mongoose.Schema

const bannerSchema = new Schema({
   text : {type : String},
   image : {type : String},
   link : {type : String},
   priority : {type: Number},
   page : {type : String}
})

const Banner = mongoose.model('Banner', bannerSchema)
module.exports = Banner