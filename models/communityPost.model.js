const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const buttonsSchema = new Schema({
    label: String,
    data: String
})

const reportSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	type: { type: String },
	text: { type: String }
})

const communityPost = new Schema({
	author: { type: Schema.Types.ObjectId, ref: 'User' },
	content: { type: String, required: true },
	media: [{ type: String }],
	mediaType: { type: String },
	likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	comments: [{ type: Schema.Types.ObjectId, ref: 'CommunityComment' }],
	contentUrl: { type: String },
	eventUrl: { type: String },
	type: { type: String, default: 'trending' },
	buttons: [buttonsSchema],
	eventDate: { type: String },
	reports: [reportSchema],
	isHidden: { type: Boolean, default: false },
	created_at: { type: Date, default: Date.now },
});

const CommunityPost = mongoose.model('CommunityPost', communityPost);
module.exports = CommunityPost;
