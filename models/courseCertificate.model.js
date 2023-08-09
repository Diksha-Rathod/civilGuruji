const { Schema, default: mongoose } = require("mongoose");

const courseCertificateSchema = new Schema({
    type: { type: String },
    html: { type: String },
    link: { type: String }
})

const courseCertificate = mongoose.model('courseCertificate', courseCertificateSchema)
module.exports = courseCertificate