const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseContentSchema = new Schema({
	courseContentName: { type: String },
	courseSubContents: [{ type: Schema.Types.ObjectId, ref: 'CourseSubContent' }],
	totalDuration: {
        DD: {type: Number},
        HH: {type: Number},
        MM: {type: Number}
    },
	totalVideos: { type: Number },
	totalDocuments: { type: Number },
	totalModels: { type: Number },
});

const CourseContent = mongoose.model('CourseContent', courseContentSchema);
module.exports = CourseContent;
