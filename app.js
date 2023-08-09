require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const logger = require('logger').createLogger('logs/app.log')
const cron = require('node-cron');
const source = process.env.mongoConnection
const sendLiveRemainderInstance = require('./utility/sendLiveRemainder');


try {
	mongoose.connect(source, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})

	const connection = mongoose.connection
	connection.once('open', () => {
		logger.info('DB connected.')
	})
} catch (err) {
	logger.error('Error : ' + err)
}
const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static('uploads'));
app.use('/media', express.static('media'));

app.get('/', function (req, res) {
	res.send('Hello Working')
})

const userRoutes = require('./controllers/user.controller')
app.use('/user', userRoutes)

const courseRoutes = require('./controllers/course.controller')
app.use('/course', courseRoutes)

const zoomRoutes = require('./controllers/zoom.controller')
app.use('/zoom', zoomRoutes)

const paymentRoutes = require('./controllers/payment.controller')
app.use('/payment', paymentRoutes)

const commentRotes = require('./controllers/comment.controller')
app.use('/comment', commentRotes)

const replyRotes = require('./controllers/reply.controller')
app.use('/reply', replyRotes)

const communityRoutes = require('./controllers/community.controller');
app.use('/community', communityRoutes);

const tokenRoutes = require('./controllers/token.controller');
app.use('/token', tokenRoutes);

const purchasesRoutes = require('./controllers/purchases.controller');
app.use('/purchases', purchasesRoutes);

const promocodeRoutes = require('./controllers/promocodes.controller');
app.use('/promocodes', promocodeRoutes);
app.use('/purchases', purchasesRoutes);

const assetsRoutes = require('./controllers/assets.controller');
app.use('/assets', assetsRoutes);

const certificateRoutes = require('./controllers/certificates.controller');
app.use('/certificates', certificateRoutes);
// cron runs in every 10 minutes
cron.schedule('* * * * *', sendLiveRemainderInstance);
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
	logger.info(`Successfully served on port: ${PORT}.`)
	console.log(`Successfully served on port: ${PORT}.`)
})
