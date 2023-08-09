const { Zoom } = require('../constants');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { getZoomAccessToken } = require('../utility/zoom');
const meeting = require('../models/meeting.model');
const router = require('express').Router();
const moment = require('moment');
router.post('/', (req, res) => {


    const KJUR = require('jsrsasign')

    const iat = Math.round(new Date().getTime() / 1000) - 30;
    const exp = iat + 60 * 60 * 2

    const Header = {
        alg: 'HS256',
        typ: 'JWT'
    }

    const Payload = {
        sdkKey: Zoom.SDK.KEY,
        mn: req.body.meetingNumber,
        role: req.body.role,
        iat: iat,
        exp: exp
    }

    const sHeader = JSON.stringify(Header)
    const sPayload = JSON.stringify(Payload)

    const meetingSignature = KJUR.KJUR.jws.JWS.sign('HS256', sHeader, sPayload, Zoom.SDK.SECRET)

    return res.json({
        signature: meetingSignature,
        sdkKey: Zoom.SDK.KEY
    })


})

const generateJwtToken = () => {
    const apiKey = 'LDtab6VaQCeYanZMM1fMJw';
    const apiSecret = 'zQ31kjKAl4SJdiIr2ByJ1HBCA4Zi6lgz';

    const payload = {
        iss: apiKey,
        exp: Math.floor(Date.now() / 1000) + 60, // Expiration time (in seconds)
    };

    const token = jwt.sign(payload, apiSecret);

    return token;
};

router.post('/createMeeting', async (req, res) => {
    try {

        const token = await getZoomAccessToken();

        if (token) {

            let { topic, start_time, courseId } = req?.body
            if (!topic || !start_time || !courseId) { return res.status(400).json({ message: 'Invalid request body!' }) }

            const payload = {
                topic,
                type: 2, // Scheduled meeting
                start_time,
                timezone: 'Asia/Calcutta',
                duration: 60, // Meeting duration in minutes
            };

            const response = await axios.post('https://api.zoom.us/v2/users/me/meetings', payload, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = response.data;
            console.log(data);

            let newMeeting = new meeting({
                ...data,
                courseId
            })

            await newMeeting.save()

            res.status(200).json({ message: 'meeting created successfully!', success: true, error: false })
        } else {
            res.status(400).json({ message: 'Invalid access token!' })
        }

    } catch (error) {
        console.log(error)
        res.status(400).json(error)
    }
})

router.get('/listMeetings/:id', async (req, res) => {
    try {

        let courseId = req?.params?.id

        if (!courseId) { return res.status(400).json({ message: 'Invalid request body!' }) }
        const currentTime = moment().format('YYYY-MM-DDTHH:mm:ssZ');
        const meetings = await meeting.find({
            courseId: courseId,
            start_time: {
              $gt: currentTime,
            },
          });
        console.log(meetings, "===========meetings");
        res.status(200).json(meetings)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
});


router.get('/endSession/:id', async (req, res) => {
    try {

        const meetingId = req?.params?.id

        if (!meetingId) { return res.status(400).json({ message: 'Invalid request!' }) }

        let result = await meeting.findByIdAndUpdate(meetingId, {
            isEnded: true
        }, { new: true })

        return res.status(200).json(result)

    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
});

module.exports = router