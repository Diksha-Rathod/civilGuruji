const { Schema, default: mongoose } = require("mongoose");

const userActivitySchema = new Schema({
    activity_type: {type : String},
    activity: {type : String},
    activity_time: {type : Date, default: Date.now}
}, {
    timestamps: true
})

const UserActivity = mongoose.model('UserActivity', userActivitySchema)
module.exports = UserActivity