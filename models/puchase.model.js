const mongoose = require('mongoose')
const Schema = mongoose.Schema

const purchaseSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    courseDetail: { type: Schema.Types.ObjectId, ref: 'Course' },
    purchasedOn: { type: Date, required: true },
    expiresOn: { type: Date, required: true },
    isActive: { type: Boolean, default: true}
    // purchasedCourses : [{type : Schema.Types.ObjectId, ref : 'Course'}],
    // ongoingCourses : [{type : Schema.Types.ObjectId, ref : 'Course'}],
    // completedCourses : [{type : Schema.Types.ObjectId, ref : 'Course'}]
})

const purchase = mongoose.model('Purchase', purchaseSchema)
module.exports = purchase