const { verifyAccessToken } = require('../middlewares/jwt.controller');

const router = require('express').Router();

router.post('/verify-course-ownership', verifyAccessToken, async (req, res) => {
    try{
        const userId = req.userId
        const { courseId } = req?.body

        if(!userId || !courseId){ return res.status(400).json({ message: 'Invalid request body!' }) }

        

    }catch(error){
        console.log(error)
        res.status(500).json(error)
    }
})

module.exports = router