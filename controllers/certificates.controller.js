const { verifyAccessToken } = require('../middlewares/jwt.controller');
const courseCertificate = require('../models/courseCertificate.model')
const CourseDetail = require('../models/courseDetail.model')
const html_to_pdf = require('html-pdf-node');
const User = require('../models/user.model');
const courseProgress = require('../models/courseProgress.model');
const moment = require('moment')
const router = require('express').Router()

router.post('/course/save', async(req, res) => {
    try{
        const { courseDetailId, type, link, html, certificateId } = req?.body

        if(!courseDetailId || !type){ return res.status(400).json({ message: 'Invalid request body!' }) }
        if(certificateId){
            let updatedCertificate = await courseCertificate.findByIdAndUpdate(certificateId, {
                type,
                html,
                link
            })
            return res.status(200).json(updatedCertificate)
        }
        const newCertificate = new courseCertificate({
            type,
            html,
            link
        })

        await newCertificate.save()
        const updatedCourse = await CourseDetail.findByIdAndUpdate(courseDetailId, {
            certificate: newCertificate?._id
        }, { new: true })
        return res.status(200).json(updatedCourse)
    }catch(error){
        console.log(error)
        res.status(500).json(error)
    }
})

router.post('/generate/:id', verifyAccessToken, async (req, res) => {
    try{
        const certificateId = req?.params?.id
        const userId = req?.userId
        const { courseId } = req?.body

        if(!certificateId || !userId || !courseId){ return res.status(400).json({ message: 'Invalid request body!' }) }

        let certificateData = await courseCertificate.findById(certificateId)

        if(!certificateData || !certificateData?.html){
            return res.status(400).json({ message: 'Invalid certificate id!' })
        }

        let userData = await User.findById(userId).populate('userDetail').populate({ path: 'purchases', populate: [{ path: 'courseDetail' }, { path: 'packageDetail' }] })

        if(!userData?._id){ return res.status(400).json({ message: 'Invalid user!' }) }

        let courseData = userData?.purchases?.find((purchaseData) => {
            console.log(JSON.stringify(purchaseData, 2, 2))
            return ((purchaseData?.courseDetail?._id == courseId) || (purchaseData?.packageDetail?._id == courseId))
        })

        if(!courseData){ return res.status(400).json({ message: 'Something went wrong1!' }) }

        let courseProgressData = await courseProgress.findOne({
			userId,
			courseId
		})

        if(!courseProgressData?.completedOn){ return res.status(400).json({ message: 'Something went wrong2!' }) }

        let LEARNERNAME = userData?.userDetail?.name
        let COURSENAME = courseData?.courseDetail?.name || courseData?.packageDetail?.name
        let DATEISSUED = moment(courseProgress?.completedOn).format('D MMMM YYYY')
        let SERIALNUMBER = `CG${LEARNERNAME?.replace(/ /g,'')?.toUpperCase()}${courseId}`

        let htmlData = certificateData?.html?.replace('{{LEARNERNAME}}', LEARNERNAME)
                                            .replace('{{COURSENAME}}', COURSENAME)
                                            .replace('{{DATEISSUED}}', DATEISSUED)
                                            .replace('{{SERIALNUMBER}}', SERIALNUMBER)

        let pdfBuffer = await html_to_pdf.generatePdf({ content: htmlData }, {
            format: 'A4',
          });
          res.setHeader('Content-Type', 'application/pdf');

        res.status(200).send(pdfBuffer)



    }catch(error){
        console.log(error)
        res.status(500).json(error)
    }
})

module.exports = router