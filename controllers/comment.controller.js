const path = require('path');
const comment = require('../models/comment.model');
const CourseSubContent = require('../models/courseSubcontent.model');
const router = require('express').Router();

// --------------  Get Routes ----------------

//add comment
router.post('/create', async (req, res) => {
	try {
		const { userId, text, subModuleId } = req?.body;

		if (!userId || !text || !subModuleId) {
			return res.status(400).send('Invalid request body!');
		}

		let newComment = new comment({
			userId,
			text,
			subModuleId,
			// replies,
		});
		await newComment.save();
		console.log('==========', newComment);
		// const getComment= await comment.getB
		await CourseSubContent.findByIdAndUpdate(
			{ _id: subModuleId },
			{ $addToSet: { comments: newComment?._id } },
			{ multi: true }
		);
		res.status(200).json(newComment);
	} catch (error) {
		console.log(error);
		res.status(500).send(error);
	}
});

//get comment
router.get('/read/:subModuleId', async (req, res) => {
	try {
		const { subModuleId } = req.params;

		if (!subModuleId) {
			return res.status(400).send('Invalid request body!');
		}
		const allComment = await comment.find({ subModuleId }).populate({path: 'userId', populate: { path: 'userDetail'}}).populate({ path: 'replies', populate: { path: 'userId', populate: { path: 'userDetail' } } });
		res.status(200).json(allComment);
	} catch (error) {
		console.log(error);
		res.status(500).send(error);
	}
});

//update comment
router.patch('/update/:id', async (req, res) => {
	try {
		const commentId = req.params.id;
		const comment = await comment.findById({ _id: commentId });
		if (!comment) {
			res.status(422).json({ message: 'Invalid comment.' });
			return;
		}
		const { text } = req?.body;

		if (!commentId || !text) {
			return res.status(400).send('Invalid request body!');
		}
		const allComment = await comment.findByIdAndUpdate({ _id: commentId }, { text });
		res.status(200).json('Comment updated');
	} catch (error) {
		console.log(error);
		res.status(500).send(error);
	}
});

module.exports = router;
