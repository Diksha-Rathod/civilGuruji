const mongoose = require('mongoose')
const Schema = mongoose.Schema

const priceSchema = new Schema({
    type: { type: String },
    isDisplay: { type: Boolean },
    planName: { type: String },
    listPrice: { type: Number },
    discountedPrice: { type: Number },
    validity: { type: String },
    validityYears: { type: Number },
    validityMonths: { type: Number },
    price: { type: Number },
    baseAmount: { type: Number },
    emiAmount: { type: Number },
})

const Price = mongoose.model('Price', priceSchema)
module.exports = Price