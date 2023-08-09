const path = require('path');
const Course = require(path.join(__dirname, '..', 'models', 'course.model'));
const CourseDetail = require(path.join(__dirname, '..', 'models', 'courseDetail.model'));
const Price = require(path.join(__dirname, '..', 'models', 'price.model'));
const mongoose = require('mongoose');
const courseCategory = require('../models/courseCategory.model');
const Learnings = require('../models/learnings.model');
const CourseSubContent = require('../models/courseSubcontent.model');
const { getVideoDuration } = require('../utility/bunny');
const Feedback = require(path.join(__dirname, '..', 'models', 'feedback.model'));
const Skill = require(path.join(__dirname, '..', 'models', 'skill.model'));
const router = require('express').Router();
var logger = require('logger').createLogger('logs/routes.log');
const Banner = require(path.join(__dirname, '..', 'models', 'banner.model'));
const CourseContent = require(path.join(__dirname, '..', 'models', 'courseContent.model'));
//const CourseSubContent = require(path.join(__dirname, '..', 'models', 'courseSubContent.model'));
const Video = require(path.join(__dirname, '..', 'models', 'video.model'));
const UserVideoData = require(path.join(__dirname, '..', 'models', 'userVideoData.model'));
const { getVideoDurationInSeconds } = require('get-video-duration');
const LearningRules = require('../models/learningRule.model');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const xlsx = require('xlsx');
const quizQuestion = require('../models/quizQuestions.model');
const Quiz = require('../models/quiz.model');
const globalVariables = require('../models/globalVariables.model');
const videoProgress = require('../models/videoProgress.model');
const User = require('../models/user.model');
const Package = require('../models/package.model');
const purchase = require('../models/purchase.model');
const moment = require('moment/moment');
const payment = require('../models/payment.model');
const CrackJob = require('../models/crackJob.model');
const Student = require('../models/student.model');
const purchases = require('../models/purchase.model');
const { uniq } = require('../utility/filters');
const { verifyAccessToken } = require('../middlewares/jwt.controller');
const courseProgress = require('../models/courseProgress.model');
const sendMail = require('../mailer/sendMail');
const AWS = require('aws-sdk')

// --------------  Get Routes ----------------

// get lastest 5 online, offline and free courses
router.get('/landing-page-courses', async (req, res) => {
	try {
		// let onlineCourses = await Course.find({ skills: { $ne: 'offline' } })
		// 	.find({ price: { $exists: true } })
		// 	.populate('price')
		// 	.sort({ $natural: -1 })
		// 	.limit(5);

		// let offlineCourses = await Course.find({ skills: 'offline' })
		// 	.populate('price')
		// 	.sort({ $natural: -1 })
		// 	.limit(5);

		// let freeCourses = await Course.find({ price: null }).sort({ $natural: -1 }).limit(5);
		console.log('HElooooooooooo');
		let data = await Course.find();
		console.log(data, '==============data');
		let allCourses = await Course.find({ category: { $exists: true } })
			.populate('category')
			.populate('prices')
			.populate('skills')
			.populate({
				path: 'courseDetail',
				populate: [
					{ path: 'learningObjectives' },
					{ path: 'courseContents', populate: { path: 'courseSubContents' } },
				],
			});
		console.log('HElooooooooooo5555555555555', allCourses);
		let allPackages = await Package.find({ category: { $exists: true } })
			.populate({
				path: 'courses',
				populate: {
					path: 'course',
					populate: [
						{ path: 'prices' },
						{
							path: 'courseDetail',
							populate: [
								{ path: 'learningObjectives' },
								{
									path: 'courseContents',
									populate: { path: 'courseSubContents' },
								},
							],
						},
					],
				},
			})
			.populate('skills')
			.populate('learningObjectives')
			.populate('type')
			.populate('category')
			.populate('prices');
		// console.log(allCourses)
		allPackages = JSON.parse(JSON.stringify(allPackages));
		if (allPackages && allPackages?.length > 0) {
			allPackages.map((packageData) => {
				allCourses.push({
					isPackage: true,
					...packageData,
				});
			});
		}

		let parsedResult = {};

		if (allCourses?.length > 0) {
			allCourses?.map((course) => {
				course?.category?.map((category) => {
					parsedResult[category?.name + '-Id-' + category?._id] = {
						data: parsedResult?.[category?.name + '-Id-' + category?._id]?.data
							? [...parsedResult?.[category?.name + '-Id-' + category?._id]?.data, course]
							: [course],
						priority: parsedResult?.[category?.name + '-Id-' + category?._id]?.priority
							? parsedResult[category?.name + '-Id-' + category?._id]?.priority
							: category?.priority,
					};
				});
			});
		}

		res.status(200).json(parsedResult);
		// res.status(200).json({
		// 	onlineCourses: onlineCourses,
		// 	freeCourses: freeCourses,
		// 	offlineCourses: offlineCourses,
		// });
	} catch (err) {
		logger.error(err);
		res.status(500).send('Error : ' + err);
	}
});

router.get('/my-courses', async (req, res) => {
	try {
		// let onlineCourses = await Course.find({ skills: { $ne: 'offline' } })
		// 	.find({ price: { $exists: true } })
		// 	.populate('price')
		// 	.sort({ $natural: -1 })
		// 	.limit(5);

		// let offlineCourses = await Course.find({ skills: 'offline' })
		// 	.populate('price')
		// 	.sort({ $natural: -1 })
		// 	.limit(5);

		// let freeCourses = await Course.find({ price: null }).sort({ $natural: -1 }).limit(5);

		let allCourses = await Course.find({ category: { $exists: true } })
			.populate('category')
			.populate('prices')
			.populate('skills')
			.populate({
				path: 'courseDetail',
				populate: [
					{ path: 'learningObjectives' },
					{ path: 'courseContents', populate: { path: 'courseSubContents' } },
				],
			});
		let allPackages = await Package.find({ category: { $exists: true } })
			.populate({ path: 'courses', populate: { path: 'course' } })
			.populate('skills')
			.populate('learningObjectives')
			.populate('type')
			.populate('category');
		// console.log(allCourses)
		allPackages = JSON.parse(JSON.stringify(allPackages));
		if (allPackages && allPackages?.length > 0) {
			allPackages.map((packageData) => {
				allCourses.push({
					isPackage: true,
					...packageData,
				});
			});
		}

		let parsedResult = {};

		if (allCourses?.length > 0) {
			allCourses?.map((course) => {
				course?.category?.map((category) => {
					parsedResult[category?.name] = {
						data: parsedResult?.[category?.name]?.data
							? [...parsedResult?.[category?.name]?.data, course]
							: [course],
						priority: parsedResult?.[category?.name]?.priority
							? parsedResult[category?.name]?.priority
							: category?.priority,
					};
				});
			});
		}

		res.status(200).json(parsedResult);
		// res.status(200).json({
		// 	onlineCourses: onlineCourses,
		// 	freeCourses: freeCourses,
		// 	offlineCourses: offlineCourses,
		// });
	} catch (err) {
		logger.error(err);
		res.status(500).send('Error : ' + err);
	}
});

// get all categories
router.get('/categories', async (req, res) => {
	try {
		let allCourseCategories = await courseCategory.find({});
		allCourseCategories = JSON.parse(JSON.stringify(allCourseCategories));
		let categoriesWithCourseList = [];

		for (let category of allCourseCategories) {
			let courseList = await Course.find({ category: category?._id });

			let finalObj = {
				...category,
			};

			if (courseList && courseList?.length > 0) {
				let courseData = courseList.map((course) => {
					return {
						name: course?.name,
						_id: course?._id,
					};
				});

				finalObj['courseList'] = courseData;
			}

			console.log(finalObj);

			categoriesWithCourseList.push(finalObj);
		}
		res.status(200).json(categoriesWithCourseList);
	} catch (error) {
		console.log(error);
		res.status(500).send('Error : ' + err);
	}
});

//add category
router.post('/category', async (req, res) => {
	try {
		const { categoryName, coursesAndPackagesIds, priority } = req?.body;

		if (!categoryName || !coursesAndPackagesIds || !priority) {
			return res.status(400).send('Invalid request body!');
		}

		// courseCategory.createIndexes((err) => {
		// 	if (err) {
		// 	  console.error(err);
		// 	} else {
		// 	  console.log('Category index created');
		// 	}
		//   });

		// find if selected priority is there
		let priorityThere = await courseCategory.find({ priority: priority });
		let allCategories = await courseCategory.find({});
		allCategories = JSON.parse(JSON.stringify(allCategories));
		allCategories = allCategories.sort((a, b) => b?.priority - a?.priority);
		let max = allCategories[0]?.priority;
		if (priorityThere?.length > 0) {
			for (let i = max; i >= priority; i--) {
				console.log({ priority: i }, { priority: i + 1 });
				await courseCategory.updateOne({ priority: i }, { priority: i + 1 });
			}
		}

		let category = new courseCategory({
			name: categoryName,
			priority: priority,
		});

		await category.save();

		await Course.update(
			{ _id: { $in: coursesAndPackagesIds } },
			{ $addToSet: { category: category?._id } },
			{ multi: true }
		);

		await Package.update(
			{ _id: { $in: coursesAndPackagesIds } },
			{ $addToSet: { category: category?._id } },
			{ multi: true }
		);

		let allCourses = await Course.find({
			_id: { $in: coursesAndPackagesIds },
		}).populate('category');

		logger.info('Updated detials for Courses : ' + allCourses);
		res.status(200).json(allCourses);
	} catch (error) {
		console.log(error);
		res.status(500).send(error);
	}
});

router.get('/all', async (req, res) => {
	try {
		let allCourses = await Course.find({}).populate('prices');
		res.status(200).json(allCourses);
	} catch (error) {
		console.log(error);
		res.status(500).send('Error : ' + error);
	}
});

router.get('/packages/all', async (req, res) => {
	try {
		let allPackages = await Package.find({})
			.populate('prices')
			.populate({
				path: 'courses',
				populate: {
					path: 'course',
					populate: [
						{
							path: 'prices',
						},
					],
				},
			});
		res.status(200).json(allPackages);
	} catch (error) {
		console.log(error);
		res.status(500).send('Error : ' + error);
	}
});

// get paginated paid courses list
router.get('/online-courses', async (req, res) => {
	try {
		const page = parseInt(req.query.page);
		const limit = parseInt(req.query.limit);

		const firstIndex = (page - 1) * limit;
		const lastIndex = page * limit;
		const paginatedList = {};
		if (firstIndex > 0) {
			paginatedList.previous = {
				previouspage: page - 1,
				limit: limit,
			};
		}
		if (lastIndex < (await Course.countDocuments().exec())) {
			paginatedList.next = {
				nextpage: page + 1,
				limit: limit,
			};
		}

		paginatedList.results = Course.find({ skills: { $ne: 'offline' } })
			.find({ price: { $exists: true } })
			.populate('price')
			.skip(firstIndex)
			.limit(limit);

		res.status(200).json(paginatedList.results);
	} catch (err) {
		logger.error('Error : ' + err);
		res.status(500).send('Error : ' + err);
	}
});

// get paginated offline courses list
router.get('/offline-courses', async (req, res) => {
	try {
		const page = parseInt(req.query.page);
		const limit = parseInt(req.query.limit);

		const firstIndex = (page - 1) * limit;
		const lastIndex = page * limit;
		const paginatedList = {};
		if (firstIndex > 0) {
			paginatedList.previous = {
				previouspage: page - 1,
				limit: limit,
			};
		}
		if (lastIndex < (await Course.countDocuments().exec())) {
			paginatedList.next = {
				nextpage: page + 1,
				limit: limit,
			};
		}

		paginatedList.results = await Course.find({ skills: 'offline' })
			.sort({ $natural: -1 })
			.populate('price')
			.skip(firstIndex)
			.limit(limit);

		res.status(200).json(paginatedList.results);
	} catch (err) {
		logger.error('Error : ' + err);
		res.status(500).send('Error : ' + err);
	}
});

// get paginated free courses list
router.get('/free-courses', async (req, res) => {
	try {
		const page = parseInt(req.query.page);
		const limit = parseInt(req.query.limit);

		const firstIndex = (page - 1) * limit;
		const lastIndex = page * limit;
		const paginatedList = {};
		if (firstIndex > 0) {
			paginatedList.previous = {
				previouspage: page - 1,
				limit: limit,
			};
		}
		if (lastIndex < (await Course.countDocuments().exec())) {
			paginatedList.next = {
				nextpage: page + 1,
				limit: limit,
			};
		}

		paginatedList.results = await Course.find({ price: null })
			.sort({ $natural: -1 })
			.populate('price')
			.skip(firstIndex)
			.limit(limit);

		res.status(200).json(paginatedList.results);
	} catch (err) {
		logger.error('Error : ' + err);
		res.status(500).send('Error : ' + err);
	}
});

// get course details by id
router.get('/course-details/:id', async (req, res) => {
	try {
		const course = await Course.findById(req.params.id)
			.populate('category')
			.populate({
				path: 'skills',
				populate: [
					{ path: 'prices' },
					{
						path: 'courseDetail',
						populate: [{ path: 'courseContents' }],
					},
				],
			})
			.populate('studentsGotJob')
			.populate('prices')
			.populate({
				path: 'finalQuiz',
				populate: {
					path: 'questions',
				},
			})
			.populate({
				path: 'courseDetail',
				populate: [
					{ path: 'learningObjectives' },
					{ path: 'certificate' },
					{ path: 'crackJobs' },
					{
						path: 'courseContents',
						populate: {
							path: 'courseSubContents',
							populate: {
								path: 'quiz',
								populate: {
									path: 'questions',
								},
							},
						},
					},
				],
			});
		if (course) {
			// await course.populate('courseDetail');
			// await course.populate('price');
			// if (course.courseDetail.feedback) {
			// 	await course.courseDetail.populate('feedback');
			// }

			// if (course.courseDetail.courseContents) {
			// 	await course.courseDetail.populate('courseContents');
			// }

			// await Promise.all(
			// 	course.courseDetail.courseContents.map(async (courseContent) => {
			// 		if (courseContent.courseSubContents) {
			// 			await courseContent.populate('courseSubContents');

			// 			if (courseContent.courseSubContents) {
			// 				await Promise.all(
			// 					courseContent.courseSubContents.map(async (courseSubContent) => {
			// 						await courseSubContent.populate('video');
			// 					})
			// 				);
			// 			}
			// 		}
			// 	})
			// );

			// await course.populate('category').populate('skills').populate({ path: 'courseDetail', populate: { path: 'learningObjectives' }})

			logger.info('Course : ' + course);
			res.status(200).json(course);
		} else {
			res.status(404).send('No Courses Found');
		}
	} catch (err) {
		logger.error('Error : ' + err);
		res.status(500).send('Error : ' + err);
	}
});

// get course details by id
router.get('/package-details/:id', async (req, res) => {
	try {
		const package = await Package.findById(req.params.id)
			.populate('prices')
			.populate('crackJobs')
			.populate('studentsGotJob')
			.populate({
				path: 'courses',
				populate: {
					path: 'course',
					populate: [
						{ path: 'prices' },
						{
							path: 'courseDetail',
							populate: [
								{ path: 'learningObjectives' },
								{
									path: 'courseContents',
									populate: { path: 'courseSubContents' },
								},
							],
						},
					],
				},
			})
			.populate({
				path: 'skills',
				populate: [
					{ path: 'prices' },
					{
						path: 'courses',
						populate: {
							path: 'course',
							populate: [
								{ path: 'prices' },
								{
									path: 'courseDetail',
									populate: [
										{
											path: 'courseContents',
											populate: { path: 'courseSubContents' },
										},
									],
								},
							],
						},
					},
				],
			})
			.populate('learningObjectives')
			.populate('type')
			.populate('category');

		if (package) {
			// await course.populate('courseDetail');
			// await course.populate('price');
			// if (course.courseDetail.feedback) {
			// 	await course.courseDetail.populate('feedback');
			// }

			// if (course.courseDetail.courseContents) {
			// 	await course.courseDetail.populate('courseContents');
			// }

			// await Promise.all(
			// 	course.courseDetail.courseContents.map(async (courseContent) => {
			// 		if (courseContent.courseSubContents) {
			// 			await courseContent.populate('courseSubContents');

			// 			if (courseContent.courseSubContents) {
			// 				await Promise.all(
			// 					courseContent.courseSubContents.map(async (courseSubContent) => {
			// 						await courseSubContent.populate('video');
			// 					})
			// 				);
			// 			}
			// 		}
			// 	})
			// );

			// await course.populate('category').populate('skills').populate({ path: 'courseDetail', populate: { path: 'learningObjectives' }})

			logger.info('Package : ' + package);
			res.status(200).json(package);
		} else {
			res.status(404).send('No Courses Found');
		}
	} catch (err) {
		logger.error('Error : ' + err);
		res.status(500).send('Error : ' + err);
	}
});

//get Courses by skill
router.get('/skill/:skill', async (req, res) => {
	try {
		// const skill = await Skill.find({name : req.params.skill});
		const freeCourses = await Course.find({ skills: req.params.skill });
		logger.info('Free courses : ' + freeCourses);
		res.status(200).json(freeCourses);
	} catch (err) {
		logger.error('Error : ' + err);
		res.status(500).send('Error : ' + err);
	}
});

router.get('/skills/all', async (req, res) => {
	try {
		let skills = await Skill.find({});
		if (skills?.length > 0) {
			return res.status(200).json(skills);
		} else {
			return res.status(200).send([]);
		}
	} catch (error) {
		console.log(error);
		res.status(500).send('Error : ' + error);
	}
});

router.get('/search', async (req, res) => {
	try {
		const regex = new RegExp(escapeRegex(req.query.query), 'gi');
		let result = await Course.find({
			$or: [{ name: regex }, { skills: regex }, { metadata: regex }],
		});
		res.send(result);
	} catch (err) {
		logger.error(err);
		res.status(500).send('Error : ' + err);
	}
});

router.get('/test123', async (req, res) => {
	res.send(__dirname);
});

router.get('/home-data', async (req, res) => {
	try {
	} catch (err) { }
});

// --------------  Post Routes ----------------

//add course
router.post('/course', async (req, res) => {
	var course = new Course({
		name: req.body.courseName,
		image: req.body.image,
		thumbnail: req.body.thumbnail,
		metadata: JSON.stringify({
			language: req.body.language,
			duration: req.body.duration,
		}),
	});
	logger.info(course);
	try {
		await course.save(function (err, course) {
			logger.info('Persisted Course : ' + course);
			res.status(200).json(course);
		});
	} catch (err) {
		logger.error(err);
		res.status(500).send('Error : ' + err);
	}
});

router.post('/add', async (req, res) => {
	try {
		const {
			title,
			description,
			skills,
			rating,
			categories,
			thumbnail,
			introVideo,
			learningObjectives,
			learnerCount,
		} = req?.body;

		let learningIds = [];

		let learnings = learningObjectives.map((learning, index) => {
			return {
				value: learning,
				index: index + 1,
			};
		});

		let createdLearnings = await Learnings.create(learnings);

		learningIds = createdLearnings.map((learning) => {
			return learning?._id;
		});

		// for(let learning of learningObjectives ){
		// 	var learnings = new Learnings({
		// 		value:
		// 	})
		// }

		var courseDetails = new CourseDetail({
			learningObjectives: learningIds,
			description: description,
		});
		await courseDetails.save();

		var course = new Course({
			name: title,
			courseDetail: courseDetails?._id,
			skills: skills,
			category: categories,
			thumbnail: thumbnail,
			rating: rating,
			introVideo: introVideo,
			learnerCount: learnerCount || 0,
		});
		logger.info(course);
		let addedCourse = await course.save();
		let getCourse = await Course.find({ _id: addedCourse?._id })
			.populate('category')
			.populate('skills')
			.populate({ path: 'courseDetail', populate: { path: 'learningObjectives' } });
		res.status(200).json(getCourse);
	} catch (err) {
		logger.error(err);
		res.status(500).send('Error : ' + err);
	}
});

//add details
router.post('/courseDetail', async (req, res) => {
	try {
		const courseDetail = new CourseDetail({
			learningObjectives: req.body.learningObjectives,
			faq: req.body.faq,
			description: req.body.description,
			info: req.body.info,
			career: req.body.career,
		});
		await courseDetail.save();
		logger.info('Course Detail Persisted : ' + courseDetail);
		var updateContent = {};
		if (req.body.listPrice) {
			const price = new Price({
				list: req.body.listPrice,
				discount: req.body.discount,
			});
			await price.save();
			logger.info('Price persited : ' + price);
			updateContent = { price: price._id, courseDetail: courseDetail._id };
		} else {
			updateContent = { courseDetail: courseDetail._id };
		}
		const course = await Course.findByIdAndUpdate(req.body.id, updateContent);
		logger.info('Updated Course Object : ' + course);
		res.status(200).json(course);
	} catch (err) {
		logger.error(err);
		res.status(500).send('Error : ' + err);
	}
});

router.post('/courseContents', async (req, res) => {
	try {
		const { modules, courseId } = req.body;

		if (!courseId) {
			return res.status(400).send('Invalid request body!');
		}

		let courseData = await Course.find({ _id: courseId })
			.populate('skills')
			.populate('category')
			.populate({
				path: 'courseDetail',
				populate: [
					{ path: 'learningObjectives' },
					{
						path: 'courseContents',
						populate: {
							path: 'courseSubContents',
							populate: { path: 'quiz', populate: { path: 'questions' } },
						},
					},
				],
			});
		if (!courseData?.length > 0) {
			return res.status(400).send('Course with id not found!');
		}
		courseData = JSON.parse(JSON.stringify(courseData[0]));

		let newContentIds = [];

		for (let module of modules) {
			let savedModule = courseData?.courseDetail?.courseContents?.find((thisModule) => {
				return thisModule?._id == module?._id;
			});

			let totalDuration = {
				DD: 0,
				HH: 0,
				MM: 0,
			};
			let totalDD = 0;
			let totalHH = 0;
			let totalMM = 0;
			let totalDocuments = 0;
			let totalVideos = 0;
			let totalModels = 0;

			let subContents = [];

			if (!savedModule) {
				// create new module and add submodules to it

				let newCreatedSubmoduleIds = [];

				for (let topic of module?.topics) {
					if (topic?.duration?.MM > 0) {
						totalMM += topic?.duration?.MM;
						while (totalMM > 59) {
							totalHH += 1;
							totalMM -= 60;
						}
					}

					if (topic?.duration?.HH > 0) {
						totalHH += topic?.duration?.HH;
						while (totalHH > 7) {
							totalDD += 1;
							totalHH -= 8;
						}
					}

					if (topic?.duration?.DD > 0) {
						totalDD += topic?.duration?.DD;
					}

					let subContentPayload = {};

					switch (topic?.type) {
						case 1:
							totalVideos += 1;
							subContentPayload = {
								type: parseInt(topic.type),
								name: topic?.name,
								description: topic?.description,
								videoUrl: topic?.videoUrl,
								attachments: topic?.attachments,
								duration: topic?.duration,
							};
							break;
						case 2:
							totalDocuments += 1;
							subContentPayload = {
								type: parseInt(topic.type),
								name: topic?.name,
								documentUrl: topic?.documentUrl,
								downloadable: topic?.downloadable,
								attachments: topic?.data?.attachments,
								duration: topic?.duration,
							};
							break;
						case 3:
							totalModels += 1;
							subContentPayload = {
								type: parseInt(topic.type),
								name: topic?.name,
								modelUrl: topic?.modelUrl,
								attachments: topic?.data?.attachments,
								duration: topic?.duration,
							};
							break;
						case 4:
							subContentPayload = {
								type: parseInt(topic.type),
								name: topic?.name,
								meetingNumber: topic?.meetingNumber,
								password: topic?.data?.password,
							};
							break;
						case 5:
							subContentPayload = {
								type: parseInt(topic.type),
								name: topic?.name,
								quiz: topic?.quiz?._id,
							};
							break;
					}

					if (subContentPayload?.type) {
						let newSubmodule = new CourseSubContent({
							...subContentPayload,
						});

						await newSubmodule.save();
						let parsedNewSubmodule = JSON.parse(JSON.stringify(newSubmodule));
						newCreatedSubmoduleIds.push(parsedNewSubmodule?._id);
					}
				}

				totalDuration = {
					DD: totalDD,
					HH: totalHH,
					MM: totalMM,
				};

				let newModule = new CourseContent({
					courseContentName: module?.module,
					courseSubContents: newCreatedSubmoduleIds,
					totalDuration,
					totalVideos,
					totalDocuments,
					totalModels,
				});

				await newModule.save();
				let parsedNewModule = JSON.parse(JSON.stringify(newModule));
				newContentIds.push(parsedNewModule?._id);
			} else {
				let updatedSubmodulesIds = [];
				// found saved modules means we have to update fields

				for (let topic of module?.topics) {
					if (topic?._id) {
						if (topic?.duration?.MM > 0) {
							totalMM += topic?.duration?.MM;
							while (totalMM > 59) {
								totalHH += 1;
								totalMM -= 60;
							}
						}

						if (topic?.duration?.HH > 0) {
							totalHH += topic?.duration.HH;
							while (totalHH > 7) {
								totalDD += 1;
								totalHH -= 8;
							}
						}

						if (topic?.duration?.DD > 0) {
							totalDD += topic?.duration.DD;
						}

						let subContentPayload = {};

						switch (topic?.type) {
							case 1:
								totalVideos += 1;
								subContentPayload = {
									type: parseInt(topic.type),
									name: topic?.name,
									description: topic?.description,
									videoUrl: topic?.videoUrl,
									attachments: topic?.attachments,
									duration: topic?.duration,
								};
								break;
							case 2:
								totalDocuments += 1;
								subContentPayload = {
									type: parseInt(topic.type),
									name: topic?.name,
									documentUrl: topic?.documentUrl,
									downloadable: topic?.downloadable,
									attachments: topic?.data?.attachments,
									duration: topic?.duration,
								};
								break;
							case 3:
								totalModels += 1;
								subContentPayload = {
									type: parseInt(topic.type),
									name: topic?.name,
									modelUrl: topic?.modelUrl,
									attachments: topic?.data?.attachments,
									duration: topic?.duration,
								};
								break;
							case 4:
								subContentPayload = {
									type: parseInt(topic.type),
									name: topic?.name,
									meetingNumber: topic?.meetingNumber,
									password: topic?.data?.password,
								};
								break;
							case 5:
								subContentPayload = {
									type: parseInt(topic.type),
									name: topic?.name,
									quiz: topic?.quiz?._id,
								};
								break;
						}

						// already created submodule
						let newData = await CourseSubContent.updateOne(
							{ _id: topic?._id },
							{ $set: { ...subContentPayload } },
							{ new: true, upsert: true }
						);

						updatedSubmodulesIds.push(newData?.upsertedId || topic?._id);
					} else {
						// create new submodule
						if (topic?.MM > 0) {
							totalMM += topic.MM;
							while (totalMM > 59) {
								totalHH += 1;
								totalMM -= 60;
							}
						}

						if (topic?.HH > 0) {
							totalHH += topic.HH;
							while (totalHH > 7) {
								totalDD += 1;
								totalHH -= 8;
							}
						}

						if (topic.DD > 0) {
							totalDD += topic.DD;
						}

						let subContentPayload = {};

						switch (topic?.type) {
							case 1:
								totalVideos += 1;
								subContentPayload = {
									type: parseInt(topic.type),
									name: topic?.name,
									description: topic?.description,
									videoUrl: topic?.videoUrl,
									attachments: topic?.attachments,
									duration: topic?.duration,
								};
								break;
							case 2:
								totalDocuments += 1;
								subContentPayload = {
									type: parseInt(topic.type),
									name: topic?.name,
									documentUrl: topic?.documentUrl,
									downloadable: topic?.downloadable,
									attachments: topic?.data?.attachments,
									duration: topic?.duration,
								};
								break;
							case 3:
								totalModels += 1;
								subContentPayload = {
									type: parseInt(topic.type),
									name: topic?.name,
									modelUrl: topic?.modelUrl,
									attachments: topic?.data?.attachments,
									duration: topic?.duration,
								};
								break;
							case 4:
								subContentPayload = {
									type: parseInt(topic.type),
									name: topic?.name,
									meetingNumber: topic?.meetingNumber,
									password: topic?.data?.password,
								};
								break;
							case 5:
								subContentPayload = {
									type: parseInt(topic.type),
									name: topic?.name,
									quiz: topic?.quiz?._id,
								};
								break;
						}

						if (subContentPayload?.type) {
							let newSubmodule = new CourseSubContent({
								...subContentPayload,
							});
							await newSubmodule.save();
							let parsedNewSubmodule = JSON.parse(JSON.stringify(newSubmodule));
							updatedSubmodulesIds.push(parsedNewSubmodule?._id);
						}
					}
				}

				let newContentId = await CourseContent.updateOne(
					{ _id: module?._id },
					{
						$set: {
							courseSubContents: updatedSubmodulesIds,
							totalDuration: {
								DD: totalDD,
								HH: totalHH,
								MM: totalMM,
							},
							totalDocuments,
							totalVideos,
							totalModels,
						},
					},
					{ new: true, upsert: true }
				);
				newContentIds.push(newContentId?.upsertedId || module?._id);
			}
		}

		let updatedCourseContent = await CourseDetail.findOneAndUpdate(
			{ _id: courseData?.courseDetail?._id || new mongoose.mongo.ObjectId() },
			{ $set: { courseContents: newContentIds } },
			{ new: true, upsert: true }
		);
		updatedCourseContent = JSON.parse(JSON.stringify(updatedCourseContent));

		if (courseData?.courseDetail?._id !== updatedCourseContent._id) {
			let updatedCourse = await Course.updateOne(
				{ _id: courseData?._id },
				{ $set: { courseDetail: updatedCourseContent?._id } }
			);
		}

		res.status(200).json(updatedCourseContent);
	} catch (err) {
		logger.error(err);
		res.status(500).send('Error : ' + err);
	}
});

router.get('/updateCourseContent', async (req, res) => {
	try {
		const courseContents = await CourseContent.updateMany(
			{ totalDuration: { $exists: true } },
			{
				totalDuration: {
					DD: 0o0,
					HH: 0o0,
					MM: 0o0,
				},
			},
			{ new: true }
		);
		res.status(200).json(courseContents);
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

router.get('/coursesPage', async (req, res) => {
	try {
		const freeCourses = await Course.find({ price: null });
		// var x = await Skill.findOne({name : "offline"});
		var offlineCourses = await Course.find({ skills: 'offline' });
		var banners = await Banner.find({ page: 'Course' }).sort({ priority: 'asc' });
		var t = { freeCourses: freeCourses, offlineCourses: offlineCourses, banners: banners };
		res.status(200).json(t);
	} catch (err) {
		logger.error(err);
		res.status(500).send('Error : ' + err);
	}
});

router.post('/forYouPage', async (req, res) => {
	try {
		var t = { ongoingCourses: [], skills: [], banners: [] };
		var vids = await UserVideoData.find({ userId: req.body.userId }, { videoId: 1, _id: 0 }).lean();
		finalArray = vids.map(function (obj) {
			return obj.videoId;
		});
		var pop_obj = {
			path: 'courseContents',
			populate: {
				path: 'courseSubContent',
				populate: { path: 'video', match: { _id: { $in: finalArray } } },
			},
			path: '',
			populate: {
				path: 'courseSubContent',
				populate: { path: 'video', match: { _id: { $in: finalArray } } },
			},
		};
		var ong = await Course.find().populate(pop_obj);
		var banners = await Banner.find({ page: 'ForYou' });
		t.ongoingCourses = ong;
		t.banners = banners;
		var t1 = {};
		for (i in req.body.skills) {
			var x1 = await Course.find({ skills: req.body.skills[i] });
			t1[req.body.skills[i]] = x1;
		}
		t.skills = t1;
		res.json(t);
	} catch (err) {
		logger.error(err);
		res.status(500).send('Error : ' + err);
	}
});

router.get('/updateDuration', async (req, res) => {
	try {
		let updatedRecords = await CourseSubContent.updateMany(
			{ duration: { $exists: true } },
			{
				duration: {
					DD: 0o0,
					HH: 0o0,
					MM: 0o0,
				},
			},
			{ new: true }
		);
		res.json(updatedRecords);
	} catch (error) {
		console.log(error);
	}
});

router.post('/learningRules/add', async (req, res) => {
	try {
		const { name } = req?.body;
		let newRule = new LearningRules({
			name,
		});
		await newRule.save();
		res.status(200).json(newRule);
	} catch (error) {
		console.log(error);
	}
});

router.post('/update', async (req, res) => {
	try {
		let { courseIds, value } = req.body;

		if (!courseIds || !(courseIds.length > 0) || !value || !(Object.keys(value).length > 0)) {
			return res.status(400).json({ message: 'Invalid request body!' });
		}

		let update = await Course.updateMany({ _id: { $in: courseIds } }, value);

		return res.status(200).json(update);
	} catch (error) {
		console.log(error);
		res.status(500).send('Error : ' + err);
	}
});

router.get('/quiz', async (req, res) => {
	try {
		let quizes = await Quiz.find({}).populate('questions');
		return res.status(200).json(quizes);
	} catch (error) {
		console.log(error);
		res.status(500).send('Error : ' + err);
	}
});

router.post('/update/quiz', async (req, res) => {
	try {
		const { quizId, courseDetailId } = req.body;

		const newSubContent = new CourseSubContent({
			name: 'Sample Quiz',
			type: 5,
			quiz: quizId,
		});

		await newSubContent.save();

		const newContent = new CourseContent({
			courseContentName: 'Quiz',
			courseSubContents: [newSubContent?._id],
		});

		await newContent.save();

		await CourseDetail.findByIdAndUpdate(courseDetailId, {
			$addToSet: { courseContents: newContent?._id },
		});

		const updatedContents = await CourseContent.find({ _id: newContent?._id }).populate({
			path: 'courseSubContents',
			populate: { path: 'quiz' },
		});

		return res.status(200).json(updatedContents);
	} catch (error) {
		console.log(error);
		return res.status(500).send('Error : ' + error);
	}
});

router.get('/learningRules', async (req, res) => {
	try {
		let allRules = await LearningRules.find({});
		res.status(200).json(allRules);
	} catch (error) {
		console.log(error);
	}
});

router.get('/videoDuration', async (req, res) => {
	try {
		let response = await getVideoDuration();
	} catch (error) {
		console.log(error);
	}
});

// --------------  Delete Routes ----------------

// Delete course by id
router.delete('/:id', async (req, res) => {
	try {
		var x = await Course.findByIdAndDelete(req.params.id);
		res.status(200).json(x);
	} catch (err) {
		logger.error(err);
		res.status(500).send('Error : ' + err);
	}
});

function escapeRegex(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

router.get('/similar-courses-list/:courseId', async (req, res) => {
	try {
		let { courseId } = req?.params;

		if (!courseId) {
			return res.status(400).json({ message: 'Invalid request!' });
		}

		let response = await Course.findById(courseId).populate({
			path: 'skills',
			populate: [
				{ path: 'prices' },
				{
					path: 'courseDetail',
					populate: [{ path: 'courseContents' }],
				},
			],
		});

		if (response?.skills) {
			return res.status(200).json(response?.skills);
		} else {
			return res.status(400).json({ message: 'Invalid course id!' });
		}
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

router.get('/similar-packages-list/:packageId', async (req, res) => {
	try {
		let { packageId } = req?.params;

		if (!packageId) {
			return res.status(400).json({ message: 'Invalid request!' });
		}

		let response = await Package.findById(packageId).populate({
			path: 'skills',
			populate: [
				{ path: 'prices' },
				{
					path: 'courses',
					populate: {
						path: 'course',
						populate: [
							{ path: 'prices' },
							{
								path: 'courseDetail',
								populate: [
									{
										path: 'courseContents',
										populate: { path: 'courseSubContents' },
									},
								],
							},
						],
					},
				},
			],
		});

		if (response?.skills) {
			return res.status(200).json(response?.skills);
		} else {
			return res.status(400).json({ message: 'Invalid course id!' });
		}
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

// LMS apis
router.get('/foryou/:id', async (req, res) => {
	try {
		let id = req.params?.id;
		if (!id) {
			return res.status(400).send('Invalid id found!');
		}
		let user = await User.findById(id).populate({
			path: 'userDetail',
			populate: {
				path: 'recommendations',
				populate: [
					{ path: 'category' },
					{ path: 'skills' },
					{
						path: 'courseDetail',
						populate: [
							{ path: 'learningObjectives' },
							{ path: 'courseContents', populate: { path: 'courseSubContents' } },
						],
					},
				],
			},
		});
		if (user) {
			console.log(user);
		}

		// let parsedResult = {}
		let parsedResult = user?.userDetail?.recommendations;

		// if(user?.userDetail?.recommendations?.length > 0){
		// 	user?.userDetail?.recommendations?.map((course) => {
		// 		course?.category?.map((category) => {
		// 			parsedResult[category?.name] = {
		// 				data: parsedResult?.[category?.name]?.data ? [...parsedResult?.[category?.name]?.data, course ] : [ course ],
		// 				priority: parsedResult?.[category?.name]?.priority ? parsedResult[category?.name]?.priority : category?.priority
		// 			}
		// 		})
		// 	})
		// }

		// user.userDetail.recommendations = parsedResult

		res.status(200).json(parsedResult);
	} catch (error) {
		console.log(error);
		res.status(500).send(error?.message || 'Error happened while deleting quiz');
	}
});

// CMS apis admin portal

//<================= course module =================>
// create
router.post('/create', async (req, res) => {
	try {
		const { title } = req.body;
		if (!title) {
			return res.status(400).send('Invalid request body!');
		}

		let newCourse = new Course({
			name: title,
		});
		newCourse = await newCourse.save();

		res.status(200).json(newCourse);
	} catch (error) {
		console.log(error);
	}
});

router.post('/package/create', async (req, res) => {
	try {
		const { title } = req.body;
		if (!title) {
			return res.status(400).send('Invalid request body!');
		}

		let newCourse = new Package({
			name: title,
		});
		newCourse = await newCourse.save();

		res.status(200).json(newCourse);
	} catch (error) {
		console.log(error);
	}
});

//update
router.post('/thumbnail', async (req, res) => {
	try {
		const { link, id } = req.body;
		if (!link || !id) {
			return res.status(400).send('Invalid request body!');
		}

		let updatedCourse = await Course.findOneAndUpdate(
			{ _id: id },
			{ thumbnail: link },
			{ new: true }
		);

		res.status(200).json(updatedCourse);
	} catch (error) {
		console.log(error);
		res.status(500).send(error?.message || 'Error happened while saving thumbnail');
	}
});

router.post('/details', async (req, res) => {
	try {
		const {
			id,
			title,
			description,
			skills,
			categories,
			rating,
			learningObjectives,
			crackJobs,
			learnerCount,
			skillsText,
			studentsGotJob,
		} = req.body;

		if (!id) {
			return res.status(400).send('Invalid request body!');
		}

		let courseData = await Course.find({ _id: id })
			.populate('skills')
			.populate('category')
			.populate({
				path: 'courseDetail',
				populate: [
					{ path: 'learningObjectives' },
					{
						path: 'courseContents',
						populate: {
							path: 'courseSubContents',
							populate: { path: 'quiz', populate: { path: 'questions' } },
						},
					},
				],
			});
		if (!courseData?.length > 0) {
			return res.status(400).send('Course with id not found!');
		}
		courseData = JSON.parse(JSON.stringify(courseData[0]));

		let learningIds = [];
		let savedLearningObjectives = [];
		if (
			courseData?.courseDetail?.learningObjectives &&
			courseData?.courseDetail?.learningObjectives?.length > 0
		) {
			courseData?.courseDetail?.learningObjectives.map((objective) => {
				savedLearningObjectives.push({
					_id: objective?._id,
					value: objective?.value,
				});
			});
		}

		if (learningObjectives && learningObjectives?.length > 0) {
			for (let [index, objectiveFromReq] of learningObjectives.entries()) {
				let existingObjective = savedLearningObjectives.find((savedObjective) => {
					return savedObjective?.value == objectiveFromReq;
				});
				if (existingObjective) {
					if (existingObjective?.index == index) {
						learningIds.push(existingObjective?._id);
					} else {
						let updatedLearning = await Learnings.findOneAndUpdate(
							{ _id: existingObjective?._id },
							{ index: index },
							{ new: true }
						);
						learningIds.push(updatedLearning?._id);
					}
				} else {
					// create new objective
					let newLearning = await Learnings.create({
						value: objectiveFromReq,
						index: index,
					});

					learningIds.push(newLearning?._id);
				}
			}
		}

		let update = {
			$set: { learningObjectives: learningIds },
		};

		let crackJobIds = [];
		let savedCrackJobIds = [];
		if (courseData?.courseDetail?.crackJobs && courseData?.courseDetail?.crackJobs?.length > 0) {
			courseData?.courseDetail?.crackJobs.map((objective) => {
				savedCrackJobIds.push({
					_id: objective?._id,
					value: objective?.value,
				});
			});
		}

		if (crackJobs && crackJobs?.length > 0) {
			for (let [index, objectiveFromReq] of crackJobs.entries()) {
				let existingObjective = savedCrackJobIds.find((savedObjective) => {
					return savedObjective?.value == objectiveFromReq;
				});
				if (existingObjective) {
					if (existingObjective?.index == index) {
						crackJobIds.push(existingObjective?._id);
					} else {
						let updatedLearning = await CrackJob.findOneAndUpdate(
							{ _id: existingObjective?._id },
							{ index: index },
							{ new: true }
						);
						crackJobIds.push(updatedLearning?._id);
					}
				} else {
					// create new objective
					let newCrackJob = await CrackJob.create({
						value: objectiveFromReq,
						index: index,
					});

					crackJobIds.push(newCrackJob?._id);
				}
			}
		}

		console.log(crackJobIds);

		update['$set'] = { ...update['$set'], crackJobs: crackJobIds };

		if (courseData?.courseDetail?.description != description) {
			update['$set'] = { ...update['$set'], description: description };
		}

		if (courseData?.courseDetail?._id) {
			//update existing course details
			let updatedDetails = await CourseDetail.findOneAndUpdate(
				{ _id: courseData?.courseDetail?._id },
				update
			);
		} else {
			// create course details and add it to course
			let newDetails = await CourseDetail.create({
				learningObjectives: learningIds,
			});

			await Course.findOneAndUpdate({ _id: id }, { courseDetail: newDetails?._id }, { new: true });
		}

		let courseUpdate = {
			$set: {},
		};

		// course name
		if (courseData?.name != title) {
			courseUpdate['$set'] = {
				...courseUpdate['$set'],
				name: title,
			};
		}

		// course name
		if (courseData?.skillsText != skillsText) {
			courseUpdate['$set'] = {
				...courseUpdate['$set'],
				skillsText: skillsText,
			};
		}

		//course skills
		let skillsIds = [];
		let savedSkillsIds = [];
		if (courseData?.skills && courseData.skills?.length > 0) {
			courseData.skills.map((skill) => {
				savedSkillsIds.push(skill?._id);
			});
		}
		if (skills && skills?.length > 0) {
			skills.map((skill) => {
				skillsIds.push(skill);
			});
		}
		if (JSON.stringify(skillsIds) != JSON.stringify(savedSkillsIds)) {
			courseUpdate['$set'] = {
				...courseUpdate['$set'],
				skills: skills,
			};
		}

		//course categories
		let categoriesIds = [];
		let savedCategoriesIds = [];
		if (courseData?.category && courseData?.category?.length > 0) {
			courseData.category.map((category) => {
				savedCategoriesIds.push(category?._id);
			});
		}
		if (categories && categories?.length > 0) {
			categories.map((category) => {
				categoriesIds.push(category);
			});
		}
		if (JSON.stringify(categoriesIds) != JSON.stringify(savedCategoriesIds)) {
			courseUpdate['$set'] = {
				...courseUpdate['$set'],
				category: categoriesIds,
			};
		}

		//course studentsGotJob
		let studentsGotJobIds = [];
		let savedStudentsGotJobIds = [];
		if (courseData?.studentsGotJob && courseData?.studentsGotJob?.length > 0) {
			courseData.studentsGotJob.map((student) => {
				savedStudentsGotJobIds.push(student?._id);
			});
		}
		if (studentsGotJob && studentsGotJob?.length > 0) {
			studentsGotJob.map((student) => {
				studentsGotJobIds.push(student);
			});
		}
		if (JSON.stringify(studentsGotJobIds) != JSON.stringify(savedStudentsGotJobIds)) {
			courseUpdate['$set'] = {
				...courseUpdate['$set'],
				studentsGotJob: studentsGotJobIds,
			};
		}

		//course rating
		let savedRating = courseData?.rating;
		if (rating != savedRating) {
			courseUpdate['$set'] = {
				...courseUpdate['$set'],
				rating: rating,
			};
		}

		//course learnerCount
		let savedLearnerCount = courseData?.learnerCount;
		if (learnerCount != savedLearnerCount) {
			courseUpdate['$set'] = {
				...courseUpdate['$set'],
				learnerCount: learnerCount,
			};
		}

		let updatedCourseData = await Course.findOneAndUpdate({ _id: id }, courseUpdate, { new: true });

		res.status(200).json(updatedCourseData);
	} catch (error) {
		console.log(error);
		res.status(500).send(error?.message || 'Error happened while');
	}
});

router.post('/package/details', async (req, res) => {
	try {
		const {
			id,
			title,
			description,
			skills,
			categories,
			rating,
			thumbnail,
			introVideo,
			learningObjectives,
			learnerCount,
			studentsGotJob,
			crackJobs,
			skillsText,
		} = req.body;

		if (!id) {
			return res.status(400).send('Invalid request body!');
		}

		let courseData = await Package.find({ _id: id })
			.populate('skills')
			.populate('courses')
			.populate('type')
			.populate('learningObjectives');

		if (!courseData?.length > 0) {
			return res.status(400).send('Course with id not found!');
		}
		courseData = JSON.parse(JSON.stringify(courseData[0]));

		let learningIds = [];
		let savedLearningObjectives = [];
		if (courseData?.learningObjectives && courseData?.learningObjectives?.length > 0) {
			courseData?.learningObjectives.map((objective) => {
				savedLearningObjectives.push({
					_id: objective?._id,
					value: objective?.value,
				});
			});
		}

		if (learningObjectives && learningObjectives?.length > 0) {
			for (let [index, objectiveFromReq] of learningObjectives.entries()) {
				let existingObjective = savedLearningObjectives.find((savedObjective) => {
					return savedObjective?.value == objectiveFromReq;
				});
				if (existingObjective) {
					if (existingObjective?.index == index) {
						learningIds.push(existingObjective?._id);
					} else {
						let updatedLearning = await Learnings.findOneAndUpdate(
							{ _id: existingObjective?._id },
							{ index: index },
							{ new: true }
						);
						learningIds.push(updatedLearning?._id);
					}
				} else {
					// create new objective
					let newLearning = await Learnings.create({
						value: objectiveFromReq,
						index: index,
					});

					learningIds.push(newLearning?._id);
				}
			}
		}

		let update = {
			$set: { learningObjectives: learningIds },
		};

		if (courseData?.description != description) {
			update['$set'] = { ...update['$set'], description: description };
		}

		// if (courseData?._id) {
		// 	//update existing course details
		// 	let updatedDetails = await CourseDetail.findOneAndUpdate(
		// 		{ _id: courseData?.courseDetail?._id },
		// 		update
		// 	)
		// } else {
		// create course details and add it to course
		// let newDetails = await CourseDetail.create({
		// 	learningObjectives: learningIds
		// })

		await Package.findOneAndUpdate({ _id: id }, update, { new: true, upsert: true });

		// }

		let courseUpdate = {
			$set: {},
		};

		// course name
		if (courseData?.name != title) {
			courseUpdate['$set'] = {
				...courseUpdate['$set'],
				name: title,
			};
		}

		//course skills
		let skillsIds = [];
		let savedSkillsIds = [];
		if (courseData?.skills && courseData.skills?.length > 0) {
			courseData.skills.map((skill) => {
				savedSkillsIds.push(skill?._id);
			});
		}
		if (skills && skills?.length > 0) {
			skills.map((skill) => {
				skillsIds.push(skill);
			});
		}
		if (JSON.stringify(skillsIds) != JSON.stringify(savedSkillsIds)) {
			courseUpdate['$set'] = {
				...courseUpdate['$set'],
				skills: skills,
			};
		}

		//course categories
		let categoriesIds = [];
		let savedCategoriesIds = [];
		if (courseData?.category && courseData?.category?.length > 0) {
			courseData.category.map((category) => {
				savedCategoriesIds.push(category?._id);
			});
		}
		if (categories && categories?.length > 0) {
			categories.map((category) => {
				categoriesIds.push(category);
			});
		}
		if (JSON.stringify(categoriesIds) != JSON.stringify(savedCategoriesIds)) {
			courseUpdate['$set'] = {
				...courseUpdate['$set'],
				category: categoriesIds,
			};
		}

		//course studentsGotJob
		let studentsGotJobIds = [];
		let savedStudentsGotJobIds = [];
		if (courseData?.studentsGotJob && courseData?.studentsGotJob?.length > 0) {
			courseData.studentsGotJob.map((student) => {
				savedStudentsGotJobIds.push(student?._id);
			});
		}
		if (studentsGotJob && studentsGotJob?.length > 0) {
			studentsGotJob.map((student) => {
				studentsGotJobIds.push(student);
			});
		}
		if (JSON.stringify(studentsGotJobIds) != JSON.stringify(savedStudentsGotJobIds)) {
			courseUpdate['$set'] = {
				...courseUpdate['$set'],
				studentsGotJob: studentsGotJobIds,
			};
		}

		//course rating
		let savedRating = courseData?.rating;
		if (rating != savedRating) {
			courseUpdate['$set'] = {
				...courseUpdate['$set'],
				rating: rating,
			};
		}

		//course thumbnail
		let savedThumbnail = courseData?.thumbnail;
		if (thumbnail != savedThumbnail) {
			courseUpdate['$set'] = {
				...courseUpdate['$set'],
				thumbnail: thumbnail,
			};
		}

		//course rating
		let savedIntroVideo = courseData?.introVideo;
		if (introVideo != savedIntroVideo) {
			courseUpdate['$set'] = {
				...courseUpdate['$set'],
				introVideo: introVideo,
			};
		}

		//course learnerCount
		let savedLearnerCount = courseData?.learnerCount;
		if (learnerCount != savedLearnerCount) {
			courseUpdate['$set'] = {
				...courseUpdate['$set'],
				learnerCount: learnerCount,
			};
		}

		let crackJobIds = [];
		let savedCrackJobIds = [];
		if (courseData?.crackJobs && courseData?.crackJobs?.length > 0) {
			courseData?.crackJobs.map((objective) => {
				savedCrackJobIds.push({
					_id: objective?._id,
					value: objective?.value,
				});
			});
		}

		if (crackJobs && crackJobs?.length > 0) {
			for (let [index, objectiveFromReq] of crackJobs.entries()) {
				let existingObjective = savedCrackJobIds.find((savedObjective) => {
					return savedObjective?.value == objectiveFromReq;
				});
				if (existingObjective) {
					if (existingObjective?.index == index) {
						crackJobIds.push(existingObjective?._id);
					} else {
						let updatedLearning = await CrackJob.findOneAndUpdate(
							{ _id: existingObjective?._id },
							{ index: index },
							{ new: true }
						);
						crackJobIds.push(updatedLearning?._id);
					}
				} else {
					// create new objective
					let newCrackJob = await CrackJob.create({
						value: objectiveFromReq,
						index: index,
					});

					crackJobIds.push(newCrackJob?._id);
				}
			}
		}

		courseUpdate['$set'] = {
			...courseUpdate['$set'],
			crackJobs: crackJobIds,
		};

		if (courseData?.skillsText != skillsText) {
			courseUpdate['$set'] = {
				...courseUpdate['$set'],
				skillsText: skillsText,
			};
		}

		let updatedCourseData = await Package.findOneAndUpdate({ _id: id }, courseUpdate, {
			new: true,
		});

		res.status(200).json(updatedCourseData);
	} catch (error) {
		console.log(error);
		res.status(500).send(error?.message || 'Error happened while');
	}
});

router.post('/package/courses/details', async (req, res) => {
	try {
		const { id, courses } = req.body;

		if (!id || !courses) {
			return res.status(400).send('Invalid request body!');
		}

		let packageData = await Package.find({ _id: id })
			.populate('skills')
			.populate('courses')
			.populate('type')
			.populate('learningObjectives');

		if (!packageData?.length > 0) {
			return res.status(400).send('Course with id not found!');
		}
		packageData = JSON.parse(JSON.stringify(packageData[0]));

		// let savedCoursesIds = []
		// let payloadCoursesIds = []
		// let courses
		// if(packageData?.courses && packageData?.courses?.length>0){
		// 	savedCoursesIds = packageData.courses.map((course) => {
		// 		return course?._id
		// 	})
		// }
		// if(courses?.length>0){
		// 	courses.map((course) => {

		// 	})
		// }

		let formatedCourses = courses.map((course) => {
			return {
				course: course?.value,
				isMandatory: course?.isMandatory,
				autoCertificate: course?.autoCertificate,
			};
		});

		let updatedCourseData = await Package.findOneAndUpdate(
			{ _id: id },
			{
				$set: {
					courses: formatedCourses,
				},
			},
			{ new: true }
		);

		res.status(200).json(updatedCourseData);
	} catch (error) {
		console.log(error);
		res.status(500).send(error?.message || 'Error happened while');
	}
});

// save introVedio by courseId
router.post('/introVedio', async (req, res) => {
	try {
		if (!req.body.link || !req.body.id) {
			return res.status(400).send('Invalid request body!');
		}
		let courseId = req.body.id;
		let courseDetails = await Course.findOneAndUpdate(
			{ _id: courseId },
			{ introVideo: req.body.link },
			{ new: true }
		);
		if (!courseDetails) {
			res.status(404).json('InValid Id');
		}
		res.status(200).json(courseDetails);
	} catch (error) {
		console.log(error);
		res.status(500).send(error?.message || 'Error happened while');
	}
});

router.post('/learningType', async (req, res) => {
	try {
		const { type, id } = req.body;
		if (!type || !id) {
			return res.status(400).send('Invalid request body!');
		}

		let updatedCourse = await Course.findOneAndUpdate(
			{ _id: id },
			{ learningRule: type },
			{ new: true }
		);

		res.status(200).json(updatedCourse);
	} catch (error) {
		console.log(error);
		res.status(500).send(error?.message || 'Error happened while saving learning type');
	}
});

router.post('/learningPercentage', async (req, res) => {
	try {
		const { percentage } = req.body;
		if (!percentage) {
			return res.status(400).send('Invalid request body!');
		}

		let updatedVariables = await globalVariables.updateOne(
			{},
			{
				learningPercentage: percentage,
			},
			{ new: true, upsert: true }
		);

		res.status(200).json(updatedVariables);
	} catch (error) {
		console.log(error);
		res.status(500).send(error?.message || 'Error happened while saving learning percentage');
	}
});

router.get('/learningPercentage', async (req, res) => {
	try {
		let currentVariables = await globalVariables.findOne({});
		let result = {
			learningPercentage: currentVariables?.learningPercentage || 0,
		};
		res.status(200).json(result);
	} catch (error) {
		console.log(error);
		res.status(500).send(error?.message || 'Error happened while saving learning percentage');
	}
});

//quiz
router.post('/quiz/add', upload.single('questionFile'), async (req, res) => {
	try {
		let { title, instructions, timeLimit, retakeAttemps, rank, showSolution, passingPercentage } =
			req?.body;

		if (!title) {
			return res.status(400).send({ message: 'title not found in body!' });
		}

		const filePath = req?.file?.path;
		if (!filePath) {
			return res.status(400).send({ message: 'questions excel file not found!' });
		}
		const workbook = xlsx.readFile(filePath);
		const sheetName = workbook.SheetNames[0];
		const worksheet = workbook.Sheets[sheetName];
		const data = xlsx.utils.sheet_to_json(worksheet);
		if (!data?.length > 0) {
			return res.status(400).send({ message: 'Provided sheet has no data!' });
		}

		let validHeaders = [
			'S No.',
			'QUESTION TEXT',
			'OPTION1',
			'OPTION2',
			'OPTION3',
			'OPTION4',
			'RIGHT ANSWER',
		];

		let isValidHeaders = true;
		validHeaders.map((header) => {
			if (!Object.keys(data[0]).includes(header)) {
				isValidHeaders = false;
			}
		});

		if (!isValidHeaders) {
			return res.status(400).send({ message: 'Invalid headers in sheet!' });
		}

		let parsedQuestionsData = data?.map((question) => {
			return {
				question: question['QUESTION TEXT'],
				options: [
					question['OPTION1'],
					question['OPTION2'],
					question['OPTION3'],
					question['OPTION4'],
				],
				solution: question['RIGHT ANSWER'],
			};
		});

		const quizQuestions = await quizQuestion.create(parsedQuestionsData);
		let quizQuestionIds = quizQuestions.map((question) => {
			return question?._id;
		});

		const quiz = new Quiz({
			title,
			instructions,
			timeLimit,
			retakeAttemps,
			rank,
			showSolution,
			passingPercentage,
			questions: quizQuestionIds,
		});

		await quiz.save();

		res.status(200).json(quiz);
	} catch (error) {
		console.log(error);
		res.status(500).send('Error : ' + error);
	}
});

router.delete('/quiz/:id', async (req, res) => {
	try {
		let id = req.params?.id;
		if (!id) {
			return res.status(400).send('Invalid id found!');
		}
		let response = await Quiz.findByIdAndDelete(id);
		res.status(200).json(response);
	} catch (error) {
		console.log(error);
		res.status(500).send(error?.message || 'Error happened while deleting quiz');
	}
});

//save final quiz
router.post('/finalQuiz', async (req, res) => {
	try {
		const { quizId, id } = req.body;
		if (!quizId || !id) {
			return res.status(400).send('Invalid request body!');
		}

		let updatedCourse = await Course.findOneAndUpdate(
			{ _id: id },
			{ finalQuiz: quizId },
			{ new: true }
		);

		res.status(200).json(updatedCourse);
	} catch (error) {
		console.log(error);
		res.status(500).send(error?.message || 'Error happened while saving learning percentage');
	}
});

// Price plans apis
router.post('/savePrice', async (req, res) => {
	try {
		let { id, plans, isPackage, listed } = req?.body;
		if (!id || !plans) {
			return res.status(400).send('Invalid request body!');
		}

		let savedData = [];

		if (isPackage) {
			savedData = await Package.find({ _id: id }).populate('prices');
		} else {
			savedData = await Course.find({ _id: id }).populate('prices');
		}
		if (
			savedData &&
			savedData?.length > 0 &&
			savedData[0]?.prices &&
			savedData[0]?.prices?.length > 0
		) {
			//update price
			console.log('Reached update price!');

			let plansToBeCreated = [];
			let createdPlans = [];

			for (let plan of plans) {
				if (plan?._id) {
					let updatedPrice = await Price.findByIdAndUpdate(plan?._id, plan, { new: true });
					createdPlans.push(updatedPrice?._id);
				} else {
					plansToBeCreated.push(plan);
				}
			}

			if (plansToBeCreated?.length > 0) {
				for (let plan of plansToBeCreated) {
					let newPlan = new Price({
						...plan,
					});
					newPlan = await newPlan.save();
					newPlan = JSON.parse(JSON.stringify(newPlan));
					createdPlans.push(newPlan?._id);
				}
			}

			// let updatedData = await Course.findByIdAndUpdate(
			// 	id,
			// 	{ $set: {
			// 		prices: plans
			// 	} },
			// 	{ new: true }
			// ).populate('prices')

			let updatedData = {};
			if (isPackage) {
				updatedData = await Package.findByIdAndUpdate(
					id,
					{
						listed: listed ? true : false,
					},
					{ new: true }
				);
			} else {
				updatedData = await Course.findByIdAndUpdate(
					id,
					{
						listed: listed ? true : false,
					},
					{ new: true }
				).exec();
			}

			updatedData.prices = createdPlans;
			updatedData = await updatedData.save();

			res.status(200).json(updatedData);
		} else {
			//add price
			console.log('Reached add price!');

			let plansIds = [];
			if (plans && plans?.length > 0) {
				for (let plan of plans) {
					let newPlan = new Price({
						...plan,
					});
					await newPlan.save();
					newPlan = JSON.parse(JSON.stringify(newPlan));
					plansIds.push(newPlan?._id);
				}
			}

			let updatedData = {};

			if (isPackage) {
				updatedData = await Package.findOneAndUpdate(
					{ _id: id },
					{
						$set: {
							prices: plansIds,
						},
						listed: listed ? true : false,
					},
					{ new: true }
				);
			} else {
				updatedData = await Course.findOneAndUpdate(
					{ _id: id },
					{
						$set: {
							prices: plansIds,
						},
						listed: listed ? true : false,
					},
					{ new: true }
				);
			}
			res.status(200).json(updatedData);
		}
	} catch (error) {
		console.log(error);
		res.status(500).send(error?.message || 'Error happened while');
	}
});

router.post('/checkout-details', async (req, res) => {
	try {
		const { courseId, planId } = req?.body;

		if (!courseId || !planId) {
			return res.status(400).send('Invalid request body!');
		}

		let planDetails = await Course.findById(courseId).populate('prices');

		if (!planDetails) {
			planDetails = await Package.findById(courseId).populate('prices');
		}

		if (planDetails?.prices && planDetails?.prices?.length > 0) {
			let plan = planDetails.prices.find((plan) => {
				return plan?._id == planId;
			});

			if (plan) {
				let responseData = JSON.parse(JSON.stringify(plan));
				responseData = {
					...responseData,
					courseName: planDetails?.name,
					courseThumbnail: planDetails?.thumbnail,
				};
				res.status(200).json(responseData);
			} else {
				res.status(400).json({ message: `No plan found with id: ${planId}` });
			}
		}

		// res.status(200).json(planDetails)
	} catch (error) {
		console.log(error);
		res.status(500).send(error?.message || 'Error happened while');
	}
});

router.post('/savePurchase', async (req, res) => {
	try {
		let { courseId, paymentData, planId, userId, mode, purchaseId, type, promocodeId } = req.body;

		if (!courseId || !paymentData || !planId || !userId || !mode) {
			return res.status(400).send('Invalid request body!');
		}
		console.log(req.body, "=======body")
		let newPayment = {};

		if (mode == 'Razorpay') {
			newPayment = new payment({
				mode: 'Razorpay',
				transactionId: paymentData?.razorpay_payment_id,
				orderId: paymentData?.razorpay_order_id,
				signature: paymentData?.razorpay_signature,
			});
		} else if (mode == 'Free') {
			newPayment = new payment({
				mode: 'Free',
				transactionId: '',
				orderId: '',
				signature: '',
			});
		} else {
			return res.status(400).json({ message: 'Invalid mode of payment!' });
		}

		await newPayment.save();
		newPayment = JSON.parse(JSON.stringify(newPayment));
		console.log(newPayment, "===========newPayment");
		//update learner count in course or package
		let courseData = await Course.findById(courseId);
		if (courseData?._id) {
			let updatedCourse = await Course.findByIdAndUpdate(courseId, {
				learnerCount: courseData?.learnerCount + 1,
			});
		} else {
			let packageData = await Package.findById(courseId);
			if (packageData?._id) {
				let updatedPackage = await Package.findByIdAndUpdate(courseId, {
					learnerCount: packageData?.learnerCount + 1,
				});
			}
		}
          console.log(courseData,"==========courseData")
		let planData = await Price.findById(planId);

		let validityDate = moment();

		if (planData?.validityYears || planData?.validityMonths) {
			if (planData?.validityYears) {
				validityDate.add(planData?.validityYears, 'years');
			}
			if (planData?.validityMonths) {
				validityDate.add(planData?.validityMonths, 'months');
			}
		} else {
			validityDate = null;
		}

		let expiresOn = moment();
		let emisPaid = null;

		if (planData?.emiAmount && type == 'base_amount') {
			expiresOn = expiresOn.add(1, 'month');
			emisPaid = 0;
		} else if (planData?.emiAmount && type == 'emi') {
			if (!purchaseId) {
				return res.status(400).json({ message: "PurchaseId is required for type 'emi'" });
			}
			let purchaseData = await purchases.findById(purchaseId);
			if (purchaseData?.validityDate && moment(purchaseData?.validityDate).isAfter(moment())) {
				await purchases.findByIdAndUpdate(purchaseId, {
					emisPaid: purchaseData?.emisPaid + 1,
					expiresOn: moment(purchaseData?.expiresOn).add(1, 'month'),
				});

				let user = await User.findById(userId);
				return res.status(200).json(user);
			}
		} else if (planData?.emiAmount && type == 'pay_all') {
			console.log('This rannnn');

			let purchaseIdForPayAll = purchaseId;

			if (!purchaseIdForPayAll) {
				let newPurchaseData = {};

				let course = await Course.findById(courseId);
				if (!course) {
					course = await Package.findById(courseId);
					if (course) {
						newPurchaseData = new purchase({
							packageDetail: courseId,
							planDetail: planId,
							payment: newPayment?._id,
							expiresOn: moment(),
							emisPaid: 3,
							validityDate,
						});
					}
				} else {
					newPurchaseData = new purchase({
						courseDetail: courseId,
						planDetail: planId,
						payment: newPayment?._id,
						expiresOn: moment(),
						emisPaid: 3,
						validityDate,
					});
				}

				await newPurchaseData.save();

				newPurchaseData = JSON.parse(JSON.stringify(newPurchaseData));
				console.log(newPurchaseData, 'Purchase data');

				let updatedUser = await User.findByIdAndUpdate(userId, {
					$push: {
						purchases: newPurchaseData?._id,
					},
				});

				purchaseIdForPayAll = newPurchaseData?._id;
			}
			let purchaseData = await purchases.findById(purchaseIdForPayAll);
			if (purchaseData?.validityDate && moment(purchaseData?.validityDate).isAfter(moment())) {
				await purchases.findByIdAndUpdate(purchaseIdForPayAll, {
					emisPaid: 3,
					expiresOn: moment(purchaseData?.expiresOn).add(3, 'month'),
				});

				let user = await User.findById(userId);
				return res.status(200).json(user);
			}
		}

		let newPurchase = {};

		let course = await Course.findById(courseId);
		if (!course) {
			course = await Package.findById(courseId);
			if (course) {
				newPurchase = new purchase({
					packageDetail: courseId,
					planDetail: planId,
					payment: newPayment?._id,
					expiresOn,
					emisPaid,
					validityDate,
					appliedPromocode: promocodeId ? promocodeId : null,
				});
			}
		} else {
			newPurchase = new purchase({
				courseDetail: courseId,
				planDetail: planId,
				payment: newPayment?._id,
				expiresOn,
				emisPaid,
				validityDate,
				appliedPromocode: promocodeId ? promocodeId : null,
			});
		}

		await newPurchase.save();

		let updatedUser = await User.findByIdAndUpdate(userId, {
			$push: {
				purchases: newPurchase?._id,
			},
		});
		console.log(updatedUser, "==============updatedUser")
		let userDetails = await User.findById(userId).
			populate('userDetail');
		console.log(userDetails, "==============userDetails")
		console.log(userDetails.userDetail.username, "==============userDetails")
		//push notification
		let params, messageBody;
		if (mode == 'Free') {
			params = {
				Message: 'Thank you ' + userDetails.userDetail.username + ' for purchase free course ',
				PhoneNumber: '+91' + updatedUser.phoneNumber,
			}
			//purchase email notification with invoice number and validity
			messageBody = `<h2>Hello ${userDetails.userDetail.username}</h2>
			<p>Thank you for purchase free course</p>
			<p>validTill ${newPurchase.expiresOn}</p>
			<p>Thank You</p>`;
		} else {
			params = {
				Message: 'Thank you ' + userDetails.userDetail.username + ' for purchase course ' + ' Invoice Id ' + paymentData?.razorpay_payment_id + ' validity ' + newPurchase.validityDate,
				PhoneNumber: '+91' + updatedUser.phoneNumber,
			}
			//purchase email notification with invoice number and validity
			messageBody = `<h2>Hello ${userDetails.userDetail.username}</h2>
			<p>Thank you for purchase course</p>
			<p>Invoice_Id ${paymentData?.razorpay_payment_id}</p>
			<p>validTill ${newPurchase.expiresOn}</p>
			<p>Thank You</p>`;
		}


		new AWS.SNS({ apiVersion: '2010-03-31' })
			.publish(params)
			.promise()
			.then(() => {
				logger.info('Message sent');
			})



		sendMail(
			userDetails.userDetail.email.toLowerCase(),
			"Purchase",
			messageBody
		);
		res.status(200).json(updatedUser);

	} catch (error) {
		console.log(error);
		res.status(500).send(error?.message || 'Error happened while saving purchase!');
	}
});

router.post('/free-plan', async (req, res) => {
	try {
		const { planId } = req?.body;
		if (!planId) {
			return res.status(400).send('Invalid request body!');
		}

		const planDetail = await Price.findById(planId);

		if (planDetail?.type) {
			if (planDetail?.type == 'Free') {
				return res.status(200).send(true);
			} else {
				return res.status(200).send(false);
			}
		} else {
			return res.status(400).json({ message: 'plan details not found!' });
		}
	} catch (error) {
		console.log(error);
		res.status(500).send(error?.message || 'Error happened while fetching plan details!');
	}
});

router.post('/upload-student', upload.none(), async (req, res) => {
	try {
		const imageBase64 = req.body.image;

		// Process the base64-encoded image as needed
		// For example, you can decode it and save it to disk

		// Decoding the base64 image
		const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
		const decodedImage = Buffer.from(base64Data, 'base64');

		// Generate a unique filename for the image
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const filename = 'image-' + uniqueSuffix + '.jpg'; // Set the desired filename and extension
		const filePath = 'uploads/' + filename;
		require('fs').writeFileSync(filePath, decodedImage);

		if (req?.body?._id) {
			let updatedStudent = await Student.findByIdAndUpdate(
				req.body._id,
				{
					name: req.body.name,
					image: filePath,
				},
				{ new: true }
			);
			return res.status(200).json(updatedStudent);
		}

		let newStudent = new Student({
			name: req.body.name,
			image: filePath,
		});

		await newStudent.save();

		res.status(200).json(newStudent);
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

router.get('/list-students', async (req, res) => {
	try {
		let students = await Student.find({});
		res.status(200).json(students);
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

router.post('/list-purchased-courses', async (req, res) => {
	try {
		const { userId } = req?.body;
		if (!userId) {
			return res.status(400).json({ message: 'Invalid credentials!' });
		}

		const user = await User.findById(userId).populate({
			path: 'purchases',
			populate: [
				{
					path: 'courseDetail',
					populate: [
						{ path: 'category' },
						{ path: 'prices' },
						{ path: 'skills' },
						{
							path: 'courseDetail',
							populate: [
								{ path: 'learningObjectives' },
								{ path: 'courseContents', populate: { path: 'courseSubContents' } },
							],
						},
					],
				},
				{ path: 'packageDetail', populate: { path: 'prices' } },
			],
		});
		if (user?.purchases?.length > 0) {
			let courses = user.purchases.map((purchase) => {
				if (purchase?.courseDetail) {
					const course = purchase?.courseDetail;
					if (!course.listed) {
						const currentDate = new Date();
						if (purchase.validityDate && purchase.validityDate > currentDate) {
							course.listed = true;
							return course;
						}
						if(purchase.validityDate==null){
							course.listed = true;
							return course;
						}
					}
					return course;
				} else if (purchase?.packageDetail) {
					return {
						...JSON.parse(JSON.stringify(purchase?.packageDetail)),
						isPackage: true,
					};
				}
			});
			console.log(courses?.length);
			let filteredCourses = uniq(courses);
			res.status(200).json(filteredCourses);
		} else {
			res.status(200).json([]);
		}
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

router.get('/list/all', async (req, res) => {
	try {
		let allCourses = await Course.find({});
		let allPackages = await Package.find({});

		let allData = [];

		if (allCourses?.length > 0) {
			allData = [...allData, ...allCourses];
		}

		if (allPackages?.length > 0) {
			allData = [...allData, ...allPackages];
		}

		res.status(200).json(allData);
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

router.post('/save-quiz-attempt', verifyAccessToken, async (req, res) => {
	try {
		let userId = req?.userId;
		const { subModuleId, courseId, courseProgressionId, questions, quiz } = req?.body;

		let quizAttempt = {
			subModule: subModuleId,
			quiz,
			questions: questions.map((question) => {
				return {
					question: question?._id,
					answer: question?.answer,
					isAttempted: question?.isAttempted,
				};
			}),
		};

		if (courseProgressionId) {
			let response = await courseProgress.findByIdAndUpdate(
				courseProgressionId,
				{
					$addToSet: { quizAttemps: quizAttempt },
				},
				{ new: true }
			);

			return res.status(200).json(response);
		} else {
			let newCourseProgreession = new courseProgress({
				userId,
				courseId,
				quizAttemps: [quizAttempt],
			});

			await newCourseProgreession.save();

			return res.status(200).json(newCourseProgreession);
		}
	} catch (error) {
		console.log(error);
	}
});

router.post('/save-final-quiz-attempt', verifyAccessToken, async (req, res) => {
	try {
		let userId = req?.userId;
		const { courseId, courseProgressionId, questions, quiz, isPassed } = req?.body;

		let quizAttempt = {
			quiz,
			questions: questions.map((question) => {
				return {
					question: question?._id,
					answer: question?.answer,
					isAttempted: question?.isAttempted,
				};
			}),
		};

		if (courseProgressionId) {
			let response = await courseProgress.findByIdAndUpdate(
				courseProgressionId,
				{
					$addToSet: { finalQuizAttempts: quizAttempt },
					completedOn: isPassed == true ? moment() : null,
				},
				{ new: true }
			);

			return res.status(200).json(response);
		} else {
			let newCourseProgreession = new courseProgress({
				userId,
				courseId,
				finalQuizAttempts: [quizAttempt],
				completedOn: isPassed == true ? moment() : null,
			});

			await newCourseProgreession.save();

			return res.status(200).json(newCourseProgreession);
		}
	} catch (error) {
		console.log(error);
	}
});

router.post('/get-progress', verifyAccessToken, async (req, res) => {
	try {
		const userId = req?.userId;
		const { courseId } = req?.body;

		const data = await courseProgress
			.findOne({
				userId,
				courseId,
			})
			.populate({
				path: 'quizAttemps',
				populate: { path: 'questions', populate: { path: 'question' } },
			})
			.populate({
				path: 'finalQuizAttempts',
				populate: { path: 'questions', populate: { path: 'question' } },
			});

		return res.status(200).json(data);
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

router.post('/save-subModule-progression', verifyAccessToken, async (req, res) => {
	try {
		const userId = req?.userId;
		const { subModuleId, courseId, courseProgressionId } = req?.body;

		if (!userId || !subModuleId || !courseId) {
			return res.status(400).json({ message: 'Invalid request body!' });
		}

		if (courseProgressionId) {
			let response = await courseProgress.findByIdAndUpdate(
				courseProgressionId,
				{
					$addToSet: { subModules: { subModule: subModuleId, isCompleted: true } },
				},
				{ new: true }
			);

			return res.status(200).json(response);
		} else {
			let newCourseProgression = new courseProgress({
				subModules: { subModule: subModuleId, isCompleted: true },
				courseId: courseId,
				userId,
			});
			await newCourseProgression.save();
			return res.status(200).json(newCourseProgression);
		}
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

router.get('/category-wise-list/:id', async (req, res) => {
	try {
		let categoryId = req?.params?.id;

		if (!categoryId) {
			return res.status(400).json({ message: 'Invalid request!' });
		}

		const categoryData = await courseCategory.findById(categoryId);
		if (!categoryData?._id) {
			return res.status(500).json({ message: 'Invalid category Id!' });
		}

		let courses = await Course.find({
			category: { $in: [categoryId] },
		});

		let packages = await Package.find({
			category: { $in: [categoryId] },
		});

		res.status(200).send({ courses: [...courses, ...packages], categoryName: categoryData?.name });
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

router.get('/learners/:id', async (req, res) => {
	try {
		let courseId = req?.params?.id;

		console.log(courseId);
		if (!courseId) {
			return res.status(400).json({ message: 'Invalid request body!' });
		}

		courseId = mongoose.Types.ObjectId(courseId);

		const learners = await User.aggregate([
			{
				$lookup: {
					from: 'purchases',
					localField: 'purchases',
					foreignField: '_id',
					as: 'matchedPurchases',
				},
			},
			{
				$match: {
					'matchedPurchases.courseDetail': courseId,
				},
			},
			{
				$lookup: {
					from: 'courses', // Replace 'courses' with the correct collection name
					localField: 'matchedPurchases.courseDetail',
					foreignField: '_id',
					as: 'populatedCourseDetail',
				},
			},
			{
				$lookup: {
					from: 'userdetails', // Replace 'userdetails' with the correct collection name
					localField: 'userDetail',
					foreignField: '_id',
					as: 'populatedUserDetail',
				},
			},
			{
				$lookup: {
					from: 'payments', // Replace 'payments' with the correct collection name
					localField: 'matchedPurchases.payment',
					foreignField: '_id',
					as: 'populatedPayment',
				},
			},
			{
				$addFields: {
					matchedPurchases: {
						$map: {
							input: '$matchedPurchases',
							as: 'purchase',
							in: {
								$mergeObjects: [
									'$$purchase',
									{
										courseDetail: {
											$arrayElemAt: [
												'$populatedCourseDetail',
												{
													$indexOfArray: ['$populatedCourseDetail._id', '$$purchase.courseDetail'],
												},
											],
										},
										payment: {
											$arrayElemAt: [
												'$populatedPayment',
												{
													$indexOfArray: ['$populatedPayment._id', '$$purchase.payment'],
												},
											],
										},
									},
								],
							},
						},
					},
					userDetail: { $arrayElemAt: ['$populatedUserDetail', 0] },
				},
			},
			{
				$project: {
					populatedCourseDetail: 0,
					populatedUserDetail: 0,
					populatedPayment: 0,
				},
			},
		]);

		res.status(200).json(learners);
	} catch (error) {
		console.log(error);
		res.status(400).json(error);
	}
});

//video related
router.get('/video/progress', async (req, res) => {
	try {
		const id = '645de6877a142bdcdbe3d9a4';

		let result = await videoProgress.find({ _id: id });
		return res.status(200).json(result);
	} catch (error) {
		console.log(error);
		res.status(500).send('Error : ' + error);
	}
});

router.post('/video/progress', async (req, res) => {
	try {
		const { progress, id } = req.body;

		if (!progress || !id) {
			return res.status(400).send('Invalid request body!');
		}

		let result = await videoProgress.findOneAndUpdate({ _id: id }, { progress: progress });

		return res.status(200).json(result);
	} catch (error) {
		console.log(error);
		res.status(500).send('Error : ' + error);
	}
});

module.exports = router;
