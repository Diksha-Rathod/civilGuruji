const { Schema, default: mongoose } = require("mongoose");


const purchaseSchema = new Schema({
    courseDetail: { type: Schema.Types.ObjectId, ref: 'Course' },
    packageDetail: { type: Schema.Types.ObjectId, ref: 'Package' },
    planDetail: { type: Schema.Types.ObjectId, ref: 'Price' },
    payment: { type: Schema.Types.ObjectId, ref: 'Payment' },
    progress: { type: Schema.Types.ObjectId, ref: 'Progress' },
    purchasedOn: { type: Date, default: Date.now() },
    expiresOn: { type: Date },
    emisPaid: { type: Number },
    appliedPromocode: { type: Schema.Types.ObjectId, ref: 'Promocode' },
    validityDate: { type: Date }
})

const purchases = mongoose.model('Purchases', purchaseSchema)
module.exports = purchases