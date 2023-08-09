const meeting = require('../models/meeting.model');
const moment = require('moment');
const purchase = require('../models/puchase.model')
const User = require('../models/user.model');
const AWS = require('aws-sdk');
const sendMail = require('../mailer/sendMail');
var logger = require('logger').createLogger('logs/routes.log');
const sendLiveMeetingRemainder = async () => {
    try {
        const currentTime = moment().format('YYYY-MM-DDTHH:mm:ssZ');
        const tenMinutesBefore = moment().subtract(10, 'minutes').format('YYYY-MM-DDTHH:mm:ssZ');
        const upcomingMeetings = await meeting.find({
            start_time: {
                $gte: tenMinutesBefore,
                $lt: currentTime,
            },
        }).populate('courseId')
            .exec();
        console.log(currentTime, tenMinutesBefore, upcomingMeetings)
        console.log(upcomingMeetings.length, "======length")
        if (upcomingMeetings.length) {
            const courseDetailIds = upcomingMeetings.map((meeting) => meeting.courseId);
            console.log(courseDetailIds, "==============courseDetailIds")
            const purchaseIds = await purchase.find({ courseDetail: { $in: courseDetailIds } }, { _id: 1 });
            console.log(purchaseIds, "==============purchaseIds")
            const userDetails = await User.find({ purchases: { $in: purchaseIds } }, 'phoneNumber').populate({
                path: 'userDetail',
                select: 'email username',
            });
            if (userDetails) {
                for (let userData of userDetails) {
                    console.log(userData.phoneNumber, userData.userDetail.email);
                    var params = {
                        Message: 'Hello ' + userData.userDetail.username + ' You have upcoming live session in 10 minutes',
                        PhoneNumber: '+91' + userData.phoneNumber,
                    }
                    new AWS.SNS({ apiVersion: '2010-03-31' })
                        .publish(params)
                        .promise()
                        .then((message) => {
                            logger.info(message)
                            logger.info('Message sent');
                        })
                    let messageBody = `<h2>Hello ${userData.userDetail.username}</h2>
                        <p>You have live session in upcoming 10 minutes</p>
                        <p>Thank You</p>
                        <p>civilguruji@gmail.com</p>`;
                    sendMail(
                        userData.userDetail.email.toLowerCase(),
                        "Live session remainder",
                        messageBody
                    );
                }

            }
        }
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}
module.exports = sendLiveMeetingRemainder;