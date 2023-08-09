const { Schema, default: mongoose } = require("mongoose");


const paymentSchema = new Schema({
    mode: { type: String },
    transactionId: { type: String },
    orderId: { type: String },
    signature: { type: String }
})

const payment = mongoose.model('Payment', paymentSchema)
module.exports = payment