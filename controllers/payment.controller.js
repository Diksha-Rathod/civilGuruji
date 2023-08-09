const Razorpay = require('razorpay');
const Course = require('../models/course.model');
const shortid = require('shortid');
const Package = require('../models/package.model');
const Promocode = require('../models/promocode.model');

const router = require('express').Router()

router.post('/razorpay', async (req, res) => {
    try {

        let { courseId, planId, type, promocode } = req?.body

        if(!courseId || !planId){ return res.status(400).send('Invalid request body!') }

        let options = {
            currency: 'INR',
            receipt: shortid.generate(),
            payment_capture: 1,
        }

        let promocodeData = {}
        let promocodeDiscountAmount = 0
        if(promocode){
            promocodeData = await Promocode.findById(promocode)
        }
        let planData = {}

        let courseData = await Course.findById(courseId).populate('prices');
        if(!(courseData && courseData?._id)){
            courseData = await Package.findById(courseId).populate('prices')
        }
        if(courseData && courseData?._id){
            // console.log(courseData)
            courseData = JSON.parse(JSON.stringify(courseData))
            if(courseData?.prices && courseData?.prices?.length>0){
                let plan = courseData?.prices.find((price) => {
                    return price?._id == planId
                })
                if(plan){
                    planData = plan
                    if(plan?.type == 'One time payment'){
                        options['amount'] = plan?.discountedPrice
                    }else if(plan?.type == 'Emi subscription'){
                        if(type == 'base_amount'){
                            options['amount'] = plan?.baseAmount
                        }else if(type == 'emi'){
                            options['amount'] = plan?.emiAmount
                        }else if(type == 'pay_all'){
                            options['amount'] = plan?.discountedPrice
                        }
                    }
                }else{
                    return res.status(400).send('Something went wrong!')
                }
            }else{
                return res.status(400).send('Something went wrong!')
            }
        }else{
            return res.status(400).send('Something went wrong!')
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY,
            key_secret: process.env.RAZORPAY_SECRET,
        });

        // const payment_capture = 1;
        // const amount = 499;
        // const currency = "INR";
        // const options = {
        //     amount: (amount * 100).toString(),
        //     currency,
        //     receipt: shortid.generate(),
        //     payment_capture,
        // };

        if(promocodeData?.discountPercentage){

            

            let discountAmount = ((options?.amount * promocodeData?.discountPercentage) / 100).toFixed(2)
            if(discountAmount < promocodeData?.maxDiscountAmount){
                promocodeDiscountAmount = discountAmount
            }else{
                promocodeDiscountAmount = promocodeData?.maxDiscountAmount
            }

            if((planData?.type == 'Emi subscription') && (type == 'base_amount')){
                promocodeDiscountAmount = 0
            }

        }

        if(promocodeDiscountAmount){
            options['amount'] = (options.amount - promocodeDiscountAmount).toFixed(2)
        }

        
        // make rupees into paisa
        options.amount = parseInt(options.amount * 100)
        console.log(options)

        const response = await razorpay.orders.create(options);

        res.status(200).json({
            id: response.id,
            currency: response.currency,
            amount: response.amount,
        });


    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

module.exports = router