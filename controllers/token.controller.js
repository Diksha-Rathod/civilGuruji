const { verifyRefreshToken, accessToken } = require('../middlewares/jwt.controller');
const User = require('../models/user.model');

const router = require('express').Router();

router.get('/refresh', verifyRefreshToken, async (req, res) => {
    try {
        const userId = req.userId
        const password = req.password

        const user = await User.findOne({ _id: userId }).populate('userDetail')

        if (user?.userDetail?.password == password ) {

            let access_token = accessToken(user?._id)

            return res.status(200).json({ access_token })
        }else{
            return res.status(403).send({ message: 'Unauthorized!' });
        }

    } catch (error) {
        console.log("error")
        console.log(JSON.stringify(error, 2, 2))
        res.status(500).json(error)
    }
})

module.exports = router