const router = require('express').Router();
const CommunityComment = require('../models/communityComment.model');
const CommunityPost = require('../models/communityPost.model');
const User = require('../models/user.model');
const { verifyAccessToken } = require('../middlewares/jwt.controller');
var logger = require('logger').createLogger('logs/routes.log');
const multer = require('multer');
const path = require('path');

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'media/');
	},
	filename: function (req, file, cb) {
		if (path.extname(file.originalname)) {
			cb(null, Date.now() + path.extname(file.originalname));
		} else {
			cb(null, Date.now() + '.jpeg');
		}
	},
});
var upload = multer({ storage: storage });

// <------------------------- POST API  ------------------------->

router.post('/post/create', verifyAccessToken, upload.array('media', 10), async (req, res) => {
	try {
		let mediaPaths = req.files.map((file) => file.filename);
		const user = await User.findById(req.userId);
		// const user = await User.findById('63c3beded179d2e2ea1a4986');
		let communityPost = new CommunityPost({
			author: user,
			content: req.body.content,
			media: mediaPaths,
			mediaType: req.body.mediaType,
		});
		await communityPost.save();
		res.status(200).send(communityPost);
	} catch (err) {
		console.log("error")
		logger.error(err);
		console.log(JSON.stringify(err, 2, 2))
		res.status(500).send(err);
	}
});

router.post('/cms/post/create', upload.array('media', 10), async (req, res) => {
	try {
		let mediaPaths = req?.files?.map((file) => file?.filename);
		const user = await User.findById('6477c2dc8e0bfc4ca2b7a711');
		// const user = await User.findById('63c3beded179d2e2ea1a4986');

		if (req.body?._id) {
		console.log(req.body._id)

			let payload = {
				content: req?.body?.content,
				contentUrl: req?.body?.contentUrl,
				type: req?.body?.type,
				eventUrl: req?.body?.eventUrl,
				buttons: JSON.parse(req?.body?.buttons || '[]'),
				eventDate: req?.body?.eventDate
			}

			

			if (mediaPaths && req?.body?.mediaType) {
				payload = {
					...payload,
					media: mediaPaths,
					mediaType: req.body.mediaType,
				}
			}


			let updatedPost = await CommunityPost.findByIdAndUpdate(
				req.body._id,
				payload
			)

			return res.status(200).json(updatedPost)

		}else{

			let communityPost = new CommunityPost({
				author: user,
				content: req.body.content,
				media: mediaPaths,
				mediaType: req.body.mediaType,
				contentUrl: req?.body?.contentUrl,
				type: req?.body?.type
			});
			await communityPost.save();
			res.status(200).send(communityPost);
		}


	} catch (err) {
		console.log("error")
		logger.error(err);
		console.log(JSON.stringify(err, 2, 2))
		res.status(500).send(err);
	}
});

router.post('/cms/post/event/create', upload.array('media', 10), async (req, res) => {
	try {
		console
		let mediaPaths = req?.files?.map((file) => file.filename);
		const user = await User.findById('6477c2dc8e0bfc4ca2b7a711');
		// const user = await User.findById('63c3beded179d2e2ea1a4986');

		if (req.body._id) {

			let payload = {
				content: req.body.content,
				eventUrl: req?.body?.eventUrl,
				type: req?.body?.type,
				buttons: JSON.parse(req?.body?.buttons || '[]'),
				eventDate: req?.body?.eventDate,
				contentUrl: req?.body?.contentUrl,
			}

			if (mediaPaths && req?.body?.mediaType) {
				payload = {
					...payload,
					media: mediaPaths,
					mediaType: req.body.mediaType,
				}
			}

			console.log(req.body._id)

			let updatedPost = await CommunityPost.findByIdAndUpdate(
				req.body._id,
				payload
			)

			return res.status(200).json(updatedPost)

		}

		let communityPost = new CommunityPost({
			author: user,
			content: req.body.content,
			media: mediaPaths,
			mediaType: req.body.mediaType,
			eventUrl: req?.body?.eventUrl,
			type: req?.body?.type,
			buttons: JSON.parse(req?.body?.buttons || '[]'),
			eventDate: req?.body?.eventDate
		});
		await communityPost.save();
		res.status(200).send(communityPost);
	} catch (err) {
		console.log("error")
		logger.error(err);
		console.log(JSON.stringify(err, 2, 2))
		res.status(500).send(err);
	}
});

router.post('/post/like', verifyAccessToken, async (req, res) => {
	try {
		let postId = req.body.postId;
		let userId = req.userId;
		let updatedPost = {};
		const post = await CommunityPost.findById(postId);
		if (post.likes.includes(userId)) {
			updatedPost = await CommunityPost.findOneAndUpdate(
				{ _id: postId },
				{ $pull: { likes: userId } },
				{ new: true }
			);
		} else {
			updatedPost = await CommunityPost.findOneAndUpdate(
				{ _id: postId },
				{ $addToSet: { likes: userId } },
				{ new: true }
			);
		}
		res.status(200).send(updatedPost);
	} catch (err) {
		logger.error(err);
		res.status(500).send('Error ' + err);
	}
});

router.post('/comment/like', verifyAccessToken, async (req, res) => {
	try {
		let postId = req.body.postId;
		let userId = req.userId;
		let updatedPost = {};
		const post = await CommunityComment.findById(postId);
		if (post.likes.includes(userId)) {
			updatedPost = await CommunityComment.findOneAndUpdate(
				{ _id: postId },
				{ $pull: { likes: userId } },
				{ new: true }
			);
		} else {
			updatedPost = await CommunityComment.findOneAndUpdate(
				{ _id: postId },
				{ $addToSet: { likes: userId } },
				{ new: true }
			);
		}
		res.status(200).send(updatedPost);
	} catch (err) {
		logger.error(err);
		res.status(500).send('Error ' + err);
	}
});

router.get('/posts', verifyAccessToken, async (req, res) => {
	try {
		let communityPosts = await CommunityPost.find().populate({ path: 'author', populate: { path: 'userDetail' } }).sort({ created_at: -1 });
		// .populate({ path: 'comments', populate: [{ path: 'author' }] });
		res.status(200).send(communityPosts);
	} catch (err) {
		logger.error(err);
		res.status(500).send('Error ' + err);
	}
});

router.get('/posts/learning', async (req, res) => {
	try {
		let communityPosts = await CommunityPost.find({ type: 'learning' }).populate({ path: 'author', populate: { path: 'userDetail' } }).sort({ created_at: -1 });
		// .populate({ path: 'comments', populate: [{ path: 'author' }] });
		res.status(200).send(communityPosts);
	} catch (err) {
		logger.error(err);
		res.status(500).send('Error ' + err);
	}
});

router.get('/posts/event', async (req, res) => {
	try {
		let communityPosts = await CommunityPost.find({ type: 'event' }).populate({ path: 'author', populate: { path: 'userDetail' } }).populate('buttons').sort({ created_at: -1 });
		// .populate({ path: 'comments', populate: [{ path: 'author' }] });
		res.status(200).send(communityPosts);
	} catch (err) {
		logger.error(err);
		res.status(500).send('Error ' + err);
	}
});

router.get('/list/posts/reported', async (req, res) => {
	try {
		let communityPosts = await CommunityPost.find({ "reports.0": { "$exists": true } }).populate({ path: 'author', populate: { path: 'userDetail' } }).populate('buttons').populate({ path: 'reports', populate: { path: 'user', populate: { path: 'userDetail' } } }).sort({ created_at: -1 });
		// .populate({ path: 'comments', populate: [{ path: 'author' }] });
		res.status(200).send(communityPosts);
	} catch (err) {
		logger.error(err);
		res.status(500).send('Error ' + err);
	}
});

router.get('/post/settings/view/:id', async (req, res) => {
	try {
		let postId = req?.params?.id

		if (!postId) { return res.status(400).json({ message: 'Invalid request!' }) }

		let post = await CommunityPost.findOne(
			{ _id: postId }
		)

		if (!post) {
			return res.status(400).json({ message: 'Invalid post id' })
		}

		// Toggle the isHidden flag
		post.isHidden = !post.isHidden;

		await post.save()


		return res.status(200).json(post)

	} catch (error) {
		console.log(error)
		res.status(500).json(error)
	}
})

router.get('/sert', async (req, res) => {
	try {
		// let postId = req?.params?.id

		// if(!postId){ return res.status(400).json({ message: 'Invalid request!' }) }

		let result = await CommunityPost.updateMany(
			{ isHidden: { $exists: false } },
			{ isHidden: false }
		)

		return res.status(200).json(result)

	} catch (error) {
		console.log(error)
		res.status(500).json(error)
	}
})

router.post('/post/report', verifyAccessToken, async (req, res) => {
	try {
		let userId = req?.userId
		const { postId, type, text } = req?.body

		if (!userId || !type || !postId) { return res.status(400).json({ message: 'Invalid request body!' }) }

		let reportData = {
			user: userId,
			type
		}

		if (text) {
			reportData['text'] = text
		}

		const postData = await CommunityPost.findOneAndUpdate(
			{ _id: postId },
			{ $addToSet: { reports: reportData } },
			{ new: true }
		);

		return res.status(200).json(postData)


	} catch (error) {
		console.log(error)
		res.status(500).json(error)
	}
})

router.get('/my-profile', verifyAccessToken, async (req, res) => {
	try {
		const user = await User.findById(req.userId);
		let communityPosts = await CommunityPost.find({ author: user._id })
			.populate('author')
			.sort({ created_at: -1 });
		res.status(200).send(communityPosts);
	} catch (err) {
		logger.error(err);
		res.status(500).send('Error ' + err);
	}
});

router.get('/post/:id', verifyAccessToken, async (req, res) => {
	try {
		let post = await CommunityPost.findById(req.params.id)
			.populate({
				path: 'comments',
				populate: [{ path: 'author', populate: { path: 'userDetail' } }],
			})
			.populate({ path: 'author', populate: { path: 'userDetail' } });
		if (post) res.status(200).send(post);
		else res.status(404).send('Not found!');
	} catch (err) {
		logger.error(err);
		res.status(500).send('Error ' + err);
	}
});

// <------------------------- POST API END ------------------------->

// <------------------------- COMMENT API ------------------------->

router.post('/comment/create', verifyAccessToken, async (req, res) => {
	try {
		const user = await User.findById(req.userId);
		if (req.body.type == 'post') {
			let communityComment = new CommunityComment({
				content: req.body.content,
				author: user,
				parent: null,
			});
			await communityComment.save();

			await CommunityPost.findOneAndUpdate(
				{ _id: req.body.id },
				{ $push: { comments: communityComment } }
			);

			res.status(200).send('success');
		} else if ((req.body.type = 'comment')) {
			let communityComment = new CommunityComment({
				content: req.body.content,
				author: user,
				parent: req.body.id,
			});
			await communityComment.save();

			await CommunityPost.findOneAndUpdate(
				{ _id: req.body.id },
				{ $push: { comments: communityComment } }
			);

			res.status(200).send('success');
		}
	} catch (err) {
		logger.error(err);
		res.status(500).send('Error ' + err);
	}
});

router.get('/comments/:id', verifyAccessToken, async (req, res) => {
	try {
		// if (req.query.type == 'post') {
		let post = await CommunityPost.findById(req.query.id).populate({
			path: 'comments',
			populate: [{ path: 'author', populate: { path: 'userDetail' } }],
		});

		// 	res.status(200).send(post.comments);
		// } else if ((req.query.type = 'comment')) {
		// let comment = await CommunityComment.findById(req.params.id).populate({
		// 	path: 'comments',
		// 	populate: [{ path: 'author' }],
		// });
		res.status(200).send(post.comments);
		// }
	} catch (err) {
		logger.error(err);
		res.status(500).send('Error ' + err);
	}
});

// <------------------------- COMMENT API END ------------------------->

module.exports = router;
