const { Schema, default: mongoose } = require("mongoose");

const promocodeSchema = new Schema({
    name: {type: String},
    discountPercentage: {type: Number},
    minimumCartValue: {type: Number},
    maxDiscountAmount: {type: Number},
    coursesType: {type: String},
    usersType: {type: String},
    courses: [{ type: String }],
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    startDate: {type: String},
    endDate: {type: String}
})

const Promocode = mongoose.model('Promocode', promocodeSchema)

module.exports = Promocode