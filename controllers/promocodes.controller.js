const { verifyAccessToken } = require('../middlewares/jwt.controller')
const Promocode = require('../models/promocode.model')

const router = require('express').Router()


router.post('/create', async (req, res) => {
    try {

        const {
            _id,
            name,
            minimumCartValue,
            maxDiscountAmount,
            discountPercentage,
            coursesType,
            usersType,
            courses,
            users,
            startDate,
            endDate
        } = req?.body

        if (!name || !minimumCartValue || !maxDiscountAmount || !discountPercentage || !coursesType || !usersType || !startDate || !endDate) {
            return res.status(400).json({ message: "Invalid request body!" })
        }

        if (_id) {
            const updatedPromocode = await Promocode.findByIdAndUpdate(_id, {
                name,
                minimumCartValue,
                maxDiscountAmount,
                discountPercentage,
                coursesType,
                usersType,
                courses,
                users,
                startDate,
                endDate
            })
            res.status(200).json(updatedPromocode)
        }else{
            let newPromocode = new Promocode({
                name,
                minimumCartValue,
                maxDiscountAmount,
                discountPercentage,
                coursesType,
                usersType,
                courses,
                users,
                startDate,
                endDate
            })
    
            await newPromocode.save()
    
            res.status(200).json(newPromocode)
        }



    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

router.get('/list/all', async (req, res) => {
    try {
        let promocodes = await Promocode.find({})
        return res.status(200).json(promocodes)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

router.get('/:name', verifyAccessToken, async (req, res) => {
    try {
        const { name } = req?.params
        if (!name) { return res.status(400).json({ message: 'Invalid request body!' }) }
        const promocodeData = await Promocode.find({ name })
        if (promocodeData && promocodeData?.length > 0) {
            return res.status(200).json(promocodeData[0])
        } else {
            return res.status(400).json({ message: "Invalid promocode!" })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})



module.exports = router