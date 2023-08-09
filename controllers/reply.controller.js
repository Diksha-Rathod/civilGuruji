const path = require('path');
const reply = require('../models/reply.model');
const comment = require('../models/comment.model');
const router = require('express').Router();

// --------------  Get Routes ----------------

//add reply
router.post('/create', async (req, res) => {
	try {
		const { userId, text, commentId } = req?.body;

		if (!userId || !text || !commentId) {
			return res.status(400).send('Invalid request body!');
		}

		let newReply = new reply({
			userId,
			text,
			commentId,
			// replies,
		});
		await newReply.save();
		console.log('==========', newReply);
		// if (replyId) {
		// 	await reply.findByIdAndUpdate(
		// 		{ _id: replyId },
		// 		{
		// 			$addToSet: { replies: newReply?._id },
		// 		},
		// 		{ multi: true, new: true }
		// 	);
		// }
		// const getReply= await reply.getB
		await comment.findByIdAndUpdate(
			{ _id: commentId },
			{ $addToSet: { replies: newReply?._id } },
			{ multi: true }
		);
		res.status(200).json(newReply);
	} catch (error) {
		console.log(error);
		res.status(500).send(error);
	}
});

//get reply
router.get('/read', async (req, res) => {
	try {
		const { commentId } = req?.body;

		if (!commentId) {
			return res.status(400).send('Invalid request body!');
		}
		const allReply = await reply.find({ commentId });
		res.status(200).json(allReply);
	} catch (error) {
		console.log(error);
		res.status(500).send(error);
	}
});

//update reply
router.patch('/update/:id', async (req, res) => {
	try {
		const replyId = req.params.id;
		const reply = await reply.findById({ _id: replyId });
		if (!reply) {
			res.status(422).json({ message: 'Invalid reply.' });
			return;
		}
		const { text } = req?.body;

		if (!replyId || !text) {
			return res.status(400).send('Invalid request body!');
		}
		const allReply = await reply.findByIdAndUpdate({ _id: replyId }, { text });
		res.status(200).json('Reply updated');
	} catch (error) {
		console.log(error);
		res.status(500).send(error);
	}
});

module.exports = router;
