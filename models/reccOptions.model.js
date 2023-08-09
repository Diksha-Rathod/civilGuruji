const { Schema, default: mongoose } = require("mongoose");

const reccOptionsSchema = new Schema({
    name: { type: String },
    skills: [{ type: Schema.Types.ObjectId, ref: 'Skill' }]
})

const reccOptions = mongoose.model('reccOptions', reccOptionsSchema)
module.exports = reccOptions