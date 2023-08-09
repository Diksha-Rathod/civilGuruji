const User = require('../models/user.model')
const UserDetail = require('../models/userDetail.model.js')
const router = require('express').Router()
var logger = require('logger').createLogger('logs/routes.log')
const AWS = require('aws-sdk')
const OTP = require('../models/otp.model')
const Notification = require('../models/notification.model')
const jwt = require('jsonwebtoken')
const ReccQ = require('../models/reccq.model')
const Recc = require('../models/recc.model')
const { Expo } = require('expo-server-sdk');
const Role = require('../models/role.model')
const Purchase = require('../models/puchase.model')
const path = require('path')
const PT = require('../models/pushToken.model')
const multer = require('multer');
const UserActivity = require('../models/userActivity.model')
const Reccq = require('../models/reccq.model')
const reccOptions = require('../models/reccOptions.model')
const md5 = require('md5')
const bcrypt = require('bcrypt');
const sendMail=require('../mailer/sendMail');
const { accessToken, refreshToken, verifyAccessToken, verifyRefreshToken } = require('../middlewares/jwt.controller')
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/')
	},
	filename: function (req, file, cb) {
		if (path.extname(file.originalname)) { cb(null, Date.now() + path.extname(file.originalname)) }
		else { cb(null, Date.now() + '.jpeg') }
	}
})
var upload = multer({ storage: storage });

router.post('/signin', async (req, res) => {
	try {

		if (req.body?.from == 'google') {
			let user = await User.findOne({ phoneNumber: req.body.phoneNumber }).populate('userDetail')
			if (user) {
				// user exists
			} else {
				user = new User({ phoneNumber: req.body.phoneNumber, roles: [] });
				await user.save()
			}

			if (user?.userDetail && user?.userDetail?.email) {
				return res.status(406).json({ message: "phone number is already registered with email!" })
			}

			logger.info('user persisted : ' + user)
			const temp = {
				_id: user._id,
				phoneNumber: user.phoneNumber,
				roles: user.roles,
				access_token: 'google',
			}
			res.status(200).json(temp)
		} else {
			let user = await User.findOne({ phoneNumber: req.body.phoneNumber }).populate('roles').populate('userDetail')
			if (user) {
				// phonenumber registered
				// await user.populate('roles')

				if (user?.userDetail && user?.userDetail?.password) {
					const temp = {
						_id: user._id,
						phoneNumber: user.phoneNumber,
						roles: user.roles,
						access_token: 'password',
					}
					return res.status(200).json(temp);

				}

			} else {
				user = new User({ phoneNumber: req.body.phoneNumber, roles: [] });
				await user.save()
				logger.info('user persisted : ' + user)
			}
			logger.info(user)
			const temp = {
				_id: user._id,
				phoneNumber: user.phoneNumber,
				roles: user.roles,
				access_token: 'OTP Sent',
			}
			logger.info('waiting for OTP')
			var t = String(Math.floor(100000 + Math.random() * 900000))
			const otp = new OTP({ userId: user._id })
			const salt = await bcrypt.genSalt(10)
			otp.otp = await bcrypt.hash(t, salt)
			logger.info(otp)
			logger.info('OTP IS ', t)
			await otp.save()
			var params = {
				Message: 'Welcome! your mobile verification code is: ' + t,
				PhoneNumber: '+91' + req.body.phoneNumber,
			}
			new AWS.SNS({ apiVersion: '2010-03-31' })
				.publish(params)
				.promise()
				.then((message) => {
					logger.info(message)
					logger.info('OTP sent')
					res.status(200).json(temp)
				})
		}


	} catch (err) {
		logger.error(err)
		console.log(err)
		res.status(500).send(err)
	}
})

router.get('/send-otp-email', async (req, res) => {
	try {
		var params = {
			TargetArn: 'arn:aws:sns:ap-south-1:589771545211:reset-pin-mail',
			Message: `Your OTP for password reset is: 50000`,
			Subject: 'Password Reset OTP',
			MessageAttributes: {
				'email': {
					DataType: 'String',
					StringValue: 'nabex33493@aramask.com',
				},
			},
		};
		new AWS.SNS({ apiVersion: '2010-03-31' })
			.publish(params)
			.promise()
			.then((message) => {
				logger.info(message)
				logger.info('OTP sent')
				res.status(200).json(message)
			})
	} catch (error) {
		console.log(error)
		res.status(500).json(error)
	}
})

router.post('/signin-with-password', async (req, res) => {
	try {
		const { password, userId } = req?.body
		const user = await User.findById(userId).populate('userDetail').populate({ path: 'purchases', populate: [{ path: 'appliedPromocode' }, { path: 'planDetail' }] })

		if (!user) { return res.status(400).json({ message: "User not found!" }) }

		const hashedPassword = md5(password)

		console.log(hashedPassword)

		if ((hashedPassword == user?.userDetail?.password)) {

			let access_token = accessToken(user._id)
			let refresh_token = refreshToken(user._id, user?.userDetail?.password)

			let response = {
				user,
				access_token,
				refresh_token
			}

			return res.status(200).json(response);
		} else {
			return res.status(406).json({ message: "Invalid credentials!" })
		}

	} catch (error) {
		console.log(error)
	}
})

router.post('/register', async (req, res) => {
	try {
		if (req.body?.from == 'google') {
			let user = await User.findOne({ phoneNumber: req.body.phoneNumber })
			if (user) {
				user.populate()
			} else {
				var purchase = new Purchase({ purchasedCourses: [], ongoingCourses: [], completedCourses: [] });
				await purchase.save();
				user = new User({ phoneNumber: req.body.phoneNumber, roles: [], purchases: purchase._id });
				await user.save()
			}

			logger.info('user persisted : ' + user)
			const temp = {
				_id: user._id,
				phoneNumber: user.phoneNumber,
				roles: user.roles,
				access_token: 'google',
			}
			res.status(200).json(temp)
		} else {
			let user = await User.findOne({ phoneNumber: req.body.phoneNumber })
			if (user) {
				await user.populate('roles')
			} else {
				user = new User({ phoneNumber: req.body.phoneNumber, roles: [] });
				await user.save()
				logger.info('user persisted : ' + user)
			}
			logger.info(user)
			const temp = {
				_id: user._id,
				phoneNumber: user.phoneNumber,
				roles: user.roles,
				access_token: 'OTP Sent',
			}
			logger.info('waiting for OTP')
			var t = String(Math.floor(100000 + Math.random() * 900000))
			const otp = new OTP({ userId: user._id })
			const salt = await bcrypt.genSalt(10)
			otp.otp = await bcrypt.hash(t, salt)
			logger.info(otp)
			logger.info('OTP IS ', t)
			await otp.save()
			var params = {
				Message: 'Welcome! your mobile verification code is: ' + t,
				PhoneNumber: '+91' + req.body.phoneNumber,
			}
			new AWS.SNS({ apiVersion: '2010-03-31' })
				.publish(params)
				.promise()
				.then((message) => {
					logger.info(message)
					logger.info('OTP sent')
					res.status(200).json(temp)
				})
		}


	} catch (err) {
		logger.error(err)
		console.log(err)
		res.status(500).send(err)
	}
})

router.post('/verify', async (req, res) => {
	try {
		let user = await User.findById(req.body._id)
			.populate('roles')
			.populate('userDetail')
			.populate({ path: 'purchases', populate: [{ path: 'appliedPromocode' }, { path: 'planDetail' }] })
			.populate('userActivity')
		logger.info('Fetched user ' + user)
		var otp = await OTP.find({ userId: req.body._id }).sort({
			updatedAt: 'descending',
		})
		logger.info(otp)
		const validPassword = await bcrypt.compare(req.body.otp, otp[0].otp)
		logger.info(validPassword)
		if (validPassword) {
			var x = jwt.sign({ id: user._id }, 'secret', { expiresIn: 86400 })
			res.cookie('x-access-token', x, { maxAge: 900000, httpOnly: true })
			user.access_token = x
			res.status(200).json(user)
		} else {
			logger.error('failed')
			res.status(401).json({
				status: 'incorrect otp',
			})
		}
	} catch (err) {
		logger.error(err)
		res.status(500).send(err)
	}
})

router.post('/verify/google', async (req, res) => {
	try {
		let { email } = req?.body
		if (!email) { return res.status(401).send({ message: 'Email not found!' }) }

		let details = await UserDetail.find({ email: email })
		if (details && details?.length > 0) {
			let userData = await User.find({ userDetail: { _id: details[0]?._id } }).populate('userDetail').populate({ path: 'purchases', populate: [{ path: 'appliedPromocode' }, { path: 'planDetail' }] })
			if (userData && userData?.length > 0) {
				return res.status(200).json(userData)
			} else {
				return res.status(200).json([])
			}
		}
		//push notification 
		var params = {
			Message: 'Welcome! to civil guruji ',
			PhoneNumber: '+91' + userData.phoneNumber,
		}
		new AWS.SNS({ apiVersion: '2010-03-31' })
			.publish(params)
			.promise()
			.then((message) => {
				logger.info(message)
				logger.info('Message sent');
			})
		// welcome email notification
		let messageBody = `<h2>Hello ${details.username}</h2>
        <p>Welcome to civil Guruji</p>
        <p>Thank You</p>`;

		sendMail(
			details.email.toLowerCase(),
			"Welcome",
			messageBody
		);
		return res.status(200).json([])


	} catch (err) {
		logger.error(err)
		console.log(err)
		res.status(500).send(err)
	}
})


// get user from mobile
router.post('/mobile', async (req, res) => {
	try {
		const { phoneNumber } = req.body
		if (!phoneNumber) { return res.status(400).send("Invalid request body") }
		let user = await User.findOne({ phoneNumber: phoneNumber })
		res.status(200).json(user)
	} catch (error) {
		console.log(error)
		res.status(400).send(error)
	}
})

//Create and populate userDetails

router.post("/details", async (req, res) => {
	try {
		if (!req?.body?.userId) { return res.status(400).send("Invalid request body!") }
		var user = await User.findById(req.body.userId);
		console.log(user,"================user")
		const details = new UserDetail({
			name: req.body.name,
			email: req.body.email,
			username: req.body.username,
			location: req.body.location,
			date_of_birth: req.body.dob,
			year_of_passing: req.body.yearOfPassing,
			profile_picture: '',
			password: md5(req.body.password)
		});
		console.log(details,"==========details")
		await details.save();

		const activity = new UserActivity({
			activity_type: "authentication",
			activity: 'signup'
		})
		await activity.save();

		user = await User.findByIdAndUpdate(req.body.userId, 
			{ userDetail: details._id, $addToSet: { userActivity: activity?._id } });
		console.log(user,"========updateduser")

		user = await User.findById(req.body.userId).
		populate('userDetail').populate('userActivity').
		populate({ path: 'purchases', populate: [{ path: 'appliedPromocode' },
		 { path: 'planDetail' }] });

		logger.info("Updated detials for user : " + user);
		let access_token = accessToken(user._id)
		let refresh_token = refreshToken(user._id, user.password)

		let response = {
			user,
			access_token,
			refresh_token
		}

		console.log(response.user.userDetail.username, "==============response.user");
		console.log(response,"==============response");

        var params = {
			Message: 'Welcome! to civil guruji ',
			PhoneNumber: '+91' + response.user.phoneNumber,
		}
		new AWS.SNS({ apiVersion: '2010-03-31' })
			.publish(params)
			.promise()
			.then((message) => {
				logger.info(message)
				logger.info('Message sent');
			})


		let messageBody = `<h2>Hello ${response.user.userDetail.username}</h2>
        <p>Welcome to civil Guruji</p>
        <p>Thank You</p>`;
		
		const info=sendMail(
			response.user.userDetail.email.toLowerCase(),
			"Welcome",
			messageBody
		);
		console.log(info,"============info")
		res.status(200).json(response);
	}
	catch (err) {
		logger.error(err);
		res.status(500).send(err);
	}
});


//get details
router.get('/details/:userId', async (req, res) => {
	try {
		const user = await User.findById(req.params.userId).populate('userDetail').populate('userActivity').populate({ path: 'purchases', populate: [{ path: 'appliedPromocode' }, { path: 'planDetail' }] });
		logger.info(user)
		res.status(200).json(user)
	} catch (err) {
		logger.error(err)
		res.status(500).send('Error ' + err)
	}
})

//update user
router.patch('/user', async (req, res) => {
	try {
		var userUpdate = {}
		var detailsUpdate = {}
		if (req.body.hasOwnProperty('name')) {
			detailsUpdate.name = req.body.name
		}
		if (req.body.hasOwnProperty('email')) {
			detailsUpdate.email = req.body.email
		}
		if (req.body.hasOwnProperty('phoneNumber')) {
			userUpdate.phoneNumber = req.body.phoneNumber
		}
		var user = await User.findOneAndUpdate({ _id: req.body.userId }, userUpdate)
		user = await User.findById(req.body.userId)
		var userDetails = await UserDetail.findOneAndUpdate(
			{ _id: user.userDetails },
			detailsUpdate
		)
		await user.populate('userDetail').populate({ path: 'purchases', populate: [{ path: 'appliedPromocode' }, { path: 'planDetail' }] })
		logger.info('Updated User: ' + user)
		res.status(200).json(user)
	} catch (err) {
		logger.error(err)
		res.status(500).send('Error ' + err)
	}
})

router.get('/questions', async (req, res) => {
	try {
		var x = await ReccQ.find({}).sort({ order: 'ascending' }).populate('options')
		res.status(200).json(x)
	} catch (err) {
		logger.error(err)
		res.status(500).send('Error ' + err)
	}
})

router.post('/question', async (req, res) => {
	try {
		const { question, options } = req?.body

		let createdOptions = await reccOptions.create(options)
		let createdOptionsIds = createdOptions?.map((option) => {
			return option?._id
		})

		let newQuestion = new Reccq({
			question: question,
			options: createdOptionsIds
		})
		await newQuestion.save();
		let addedQuestion = await Reccq.find({ _id: newQuestion?._id }).populate('options')
		return res.status(200).json(addedQuestion)
	} catch (error) {
		console.log(error)
		return res.status(500).send(error)
	}
})

router.post('/reccomendations', async (req, res) => {
	try {
		const { userId, choice } = req?.body
		if (!userId || !choice) { return res.status(400).send("Invalid request body!") }
		var user = await User.findById(userId)
		var dets = await UserDetail.findByIdAndUpdate(user.userDetail, {
			recommendations: choice,
		})
		user = await User.findById(userId).populate('userDetail').populate({ path: 'purchases', populate: [{ path: 'appliedPromocode' }, { path: 'planDetail' }] })
		res.status(200).json(user)
	} catch (err) {
		logger.error(err)
		res.status(500).send('Error ' + err)
	}
}),

	router.post('/buyCourse', async (req, res) => {
		try {
			var user = await User.findById(req.body.userId).lean();
			var purchase = await Purchase.findByIdAndUpdate(user.purchases, { $addToSet: { purchasedCourses: req.body.courseId } });
			user = await User.findById(req.body.userId).populate('userDetail').populate({ path: 'purchases', populate: [{ path: 'appliedPromocode' }, { path: 'planDetail' }] });
			res.status(200).json({ "Messsage": "Purchase Successful" })
		}
		catch (err) {
			logger.error(err);
			res.status(500).send('Error ' + err);
		}
	})

router.post('/setPushToken', async (req, res) => {
	try {
		if (!Expo.isExpoPushToken(req.body.pushToken)) {
			throw "Push token is not valid"
		}
		else {
			var x = new PT({ userId: req.body.userId, pushToken: req.body.pushToken });
			await x.save();
			res.status(200).send(x);
		}
	}
	catch (err) {
		logger.error(err);
		res.status(500).send('Error ' + err);
	}
})

router.post('/sendNotification', async (req, res) => {
	try {
		var x = await PT.find({ userId: req.body.userId });
		if (!x.length) {
			res.status(404).send("Push token Not set for user")
		}
		else {
			let chunks = expo.chunkPushNotifications([{
				to: x.pushToken,
				sound: "default",
				title: req.body.title,
				body: req.body.content,
				data: { content }
			}]);
			(async () => {
				for (let chunk of chunks) {
					try {
						let receipts = await expo.sendPushNotificationsAsync(chunk);
						res.status(200).json(receipts)
					} catch (error) {
						throw error
					}
				}
			})();
		}
	}
	catch (err) {
		logger.error(err);
		res.status(500).send('Error ' + err);
	}
})

router.get('/notifications', async (req, res) => {
	try {
		var notifications = await Notification.UpdateMany({ userId: req.body.userId }, { read: True });
		res.status(200).json(notifications)

	}
	catch (err) {
		logger.error(err);
		res.status(500).send('Error ' + err);
	}
})


// router.get('/login/token/:type', async (req, res) => {
// 	try {
// 		let type = req.params.type
// 		if (!type || !((type == 'access') || (type == 'refresh'))) { return res.status(403).json({ message: 'Invalid request body!' }) }

// 		if (type == 'access') {
// 			verifyAccessToken(req, res, async (req, res) => {
// 				const user = await User.findById(req?.userId).populate('userDetail').populate('purchases')
// 				if (user) {
// 					return res.status(200).json(user)
// 				} else {
// 					return res.status(403).json({ message: 'Unauthorized' })
// 				}
// 			})
// 		}

// 		if (type == 'refresh') {
// 			verifyRefreshToken(req, res, async (req, res) => {
// 				const user = await User.find({
// 					_id: req?.userId,
// 					password: req?.password
// 				}).populate('userDetail').populate('purchases')
// 				if (user) {
// 					let response = {
// 						user: user[0],
// 						accessToken: accessToken(user[0]?._id)
// 					}
// 					return res.status(200).json(response)
// 				} else {
// 					return res.status(403).json({ message: 'Unauthorized' })
// 				}
// 			})
// 		}

// 	} catch (error) {
// 		console.log(error)
// 		res.status(500).json({ message: 'Internal server error!' })
// 	}
// })

router.get('/login/token/access', verifyAccessToken, async (req, res) => {
	try {

		const user = await User.findById(req?.userId).populate('userDetail').populate({ path: 'purchases', populate: [{ path: 'appliedPromocode' }, { path: 'planDetail' }] })
		if (user) {
			return res.status(200).json(user)
		} else {
			return res.status(403).json({ message: 'Unauthorized' })
		}

	} catch (error) {
		console.log(error)
		res.status(500).json({ message: 'Internal server error!' })
	}
})

router.get('/login/token/refresh', verifyRefreshToken, async (req, res) => {
	try {

		const user = await User.find({
			_id: req?.userId,
			password: req?.password
		}).populate('userDetail').populate({ path: 'purchases', populate: [{ path: 'appliedPromocode' }, { path: 'planDetail' }] })
		if (user) {
			let response = {
				user: user[0],
				accessToken: accessToken(user[0]?._id)
			}
			return res.status(200).json(response)
		} else {
			return res.status(403).json({ message: 'Unauthorized' })
		}

	} catch (error) {
		console.log(error)
		res.status(500).json({ message: 'Internal server error!' })
	}
})

router.get('/list/all', async (req, res) => {
	try {
		let allUsers = await User.find({ userDetail: { $exists: true } }).populate('userDetail')

		res.status(200).json(allUsers)

	} catch (error) {
		console.log(error)
		res.status(500).json(error)
	}
})

router.post('/profile-details', verifyAccessToken, async (req, res) => {
	try {
		let { userId } = req
		let data = req.body

		let userData = await User.findById(userId)
		if (userData) { userData = JSON.parse(JSON.stringify(userData)) }

		if (userData?.userDetail) {
			let updatedUserDetail = await UserDetail.findByIdAndUpdate(userData?.userDetail, data, { new: true })

			let updatedUser = await User.findById(userId).populate('userDetail').populate('userActivity').populate({ path: 'purchases', populate: [{ path: 'appliedPromocode' }, { path: 'planDetail' }] });
			res.status(200).json(updatedUser)
		}


	} catch (error) {
		console.log(error)
		res.status(500).json(error)
	}
})

router.post('/save-hear-about', verifyAccessToken, async (req, res) => {
	try {
		let { userId } = req
		let { hearAbout } = req.body
		if (!hearAbout) { return res.status(400).json({ message: "Invalid request body!" }) }
		let user = await User.findByIdAndUpdate(userId, {
			hearAbout
		}, { new: true }).populate('userDetail').populate('userActivity').populate({ path: 'purchases', populate: [{ path: 'appliedPromocode' }, { path: 'planDetail' }] });

		return res.status(200).json(user)
	} catch (error) {
		console.log(error)
		res.status(500).json(error)
	}
})

router.post('/change-password', verifyAccessToken, async (req, res) => {
	try {
		let { userId } = req
		let data = req.body

		if (!data) { return res.status(400).json({ message: "Invalid request body!" }) }

		let oldPassword = md5(data.currentPassword)

		let newPassword = md5(data.newPassword)

		let userData = await User.findById(userId).populate('userDetail')

		if (userData?.userDetail?.password !== oldPassword) {
			return res.status(400).json({ message: "Invalid password!" })
		}

		if (userData) { userData = JSON.parse(JSON.stringify(userData)) }

		if (userData?.userDetail) {
			let updatedUserDetail = await UserDetail.findByIdAndUpdate(userData?.userDetail, {
				password: newPassword
			}, { new: true })

			let updatedUser = await User.findById(userId).populate('userDetail').populate('userActivity').populate({ path: 'purchases', populate: [{ path: 'appliedPromocode' }, { path: 'planDetail' }] });
			res.status(200).json(updatedUser)
		}

	} catch (error) {
		console.log(error)
		res.status(500).json(error)
	}
})

module.exports = router
