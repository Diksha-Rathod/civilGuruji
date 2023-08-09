const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const communityComment = new Schema({
	content: { type: String, required: true },
	author: { type: Schema.Types.ObjectId, ref: 'User' },
	parent: { type: Schema.Types.ObjectId, ref: 'CommentComment', default: null },
	comments: [{ type: Schema.Types.ObjectId, ref: 'CommunityComment', default: null }],
	likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	created_at: { type: Date, default: Date.now },
});

const CommunityComment = mongoose.model('CommunityComment', communityComment);
module.exports = CommunityComment;
