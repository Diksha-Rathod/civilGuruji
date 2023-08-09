const { Schema, default: mongoose } = require("mongoose");

const courseSchema = new Schema({
    course: { type: Schema.Types.ObjectId, ref: 'Course' },
    isMandatory: { type: Boolean },
    autoCertificate: { type: Boolean }
})


const packageSchema = new Schema({
    name: {type: String},
	prices: [{ type: Schema.Types.ObjectId, ref: 'Price' }],
    description: {type: String},
    skills: [{type: Schema.Types.ObjectId, ref: 'Package'}],
    category: {
		type: [{ type: Schema.Types.ObjectId, ref: 'CourseCategory' }]
	},
    courses: [courseSchema],
    rating: { type: String },
	studentsGotJob: [{ type: Schema.Types.ObjectId, ref: 'Student'}],
	crackJobs: [{ type: Schema.Types.ObjectId, ref: 'CrackJob' }],
	skillsText: { type: String},
    enrolled: { type: String },
    thumbnail: { type: String },
    introVideo: { type: String },
    learnerCount: { type: Number },
    type: { type: Schema.Types.ObjectId, ref: 'packageType' },
    learningObjectives: [{ type: Schema.Types.ObjectId, ref: 'Learnings' }],
    listed: { type: Boolean, default: false }
}, { timestamps: true })

const Package = mongoose.model('Package', packageSchema)
module.exports = Package