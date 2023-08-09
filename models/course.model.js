const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseSchema = new Schema({
	name: { type: String, required: true },
	prices: [{ type: Schema.Types.ObjectId, ref: 'Price' }],
	courseDetail: { type: Schema.Types.ObjectId, ref: 'CourseDetail' },
	skills: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
	skillsText: { type: String},
	studentsGotJob: [{ type: Schema.Types.ObjectId, ref: 'Student'}],
	// image: { type: String, required: true },
	introVideo: { type: String },
	thumbnail: { type: String },
	metadata: { type: String },
	rating: { type: String },
	enrolled: { type: String },
	jobs: { type: String },
	category: {
		type: [{ type: Schema.Types.ObjectId, ref: 'CourseCategory' }]
	},
	learnerCount: { type: Number },
	learningRule: { type: String },
	finalQuiz: { type: Schema.Types.ObjectId, ref: 'Quiz' },
	listed: { type: Boolean, default: false }
}, { timestamps: true });
courseSchema.index({ name: 'text', metadata: 'text', skills: 'text' });

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
