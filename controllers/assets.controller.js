const Banner = require('../models/banner.model');

const router = require('express').Router()

router.post('/upload-banner-asset', async (req, res) => {
    try{
        const imageBase64 = req.body?.image;
        let filePath = ''

        if(imageBase64){
            // Process the base64-encoded image as needed
            // For example, you can decode it and save it to disk
    
            // Decoding the base64 image
            const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
            const decodedImage = Buffer.from(base64Data, 'base64');
    
            // Generate a unique filename for the image
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const filename = 'image-' + uniqueSuffix + '.jpg'; // Set the desired filename and extension
            filePath = 'uploads/' + filename;
            require('fs').writeFileSync(filePath, decodedImage);
        }


		if (req?.body?._id) {

            let update = {}
            if(req.body?.text){update['text'] = req.body?.text}
            if(req.body?.link){update['link'] = req.body?.link}
            if(req.body?.image){update['image'] = filePath}

			let updatedBanner = await Banner.findByIdAndUpdate(req.body._id, update, { new: true })
			return res.status(200).json(updatedBanner)
		}

		let newBanner = new Banner({
			text: req.body.text,
			image: filePath,
            link: req.body.link
		})

		await newBanner.save()

		res.status(200).json(newBanner);
    }catch(error){
        console.log(error)
        res.status(500).json(error)
    }
})

router.delete('/delete-banner-asset/:id', async (req, res) => {
    try{
        const id = req?.params?.id
        if(!id){
            return res.status(400).json({ message: 'Invalid request' })
        }

        const result = await Banner.findByIdAndDelete(id)

        return res.status(200).json(result)

    }catch(error){
        console.log(error)
        res.status(500).json(error)
    }
})

router.get('/list-banners', async (req, res) => {
    try{
        const banners = await Banner.find({})
        return res.status(200).json(banners)
    }catch(error){
        console.log(error)
        res.status(500).json(error)
    }
})

module.exports = router