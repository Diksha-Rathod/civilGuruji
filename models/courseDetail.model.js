const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseDetailSchema = new Schema({
	learningObjectives: [{ type: Schema.Types.ObjectId, ref: 'Learnings' }],
	crackJobs: [{ type: Schema.Types.ObjectId, ref: 'CrackJob' }],
	faq: { type: String },
	skills: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],
	description: { type: String },
	info: { type: String },
	career: [{ type: String }],
	feedback: [{ type: Schema.Types.ObjectId, ref: 'Feedback' }],
	courseContents: [{ type: Schema.Types.ObjectId, ref: 'CourseContent' }],
	certificate: { type: Schema.Types.ObjectId, ref: 'courseCertificate' }
});

const CourseDetail = mongoose.model('CourseDetail', courseDetailSchema);
module.exports = CourseDetail;
