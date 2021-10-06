//Importing modules
const path = require('path')
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const express = require('express');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');
const bodyParser = require('body-parser');

const AppError = require('./utils/appError');
const globalErrorController = require('./controllers/errorController');
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');
const bookingRouter = require('./routes/bookingRouter');
const bookingController = require('./controllers/bookingController');

const viewRouter = require('./routes/viewRouter');

//Start Express
const app = express();

//Setting for Trusting Prxy
app.enable('trust proxy');

//Implement Cors
app.use(cors());
//To Allow our api only to some origins i.e websites we use
// app.use(cors({
//     origin: 'https://www.natours.com'
// }));

//Simple Requests (get or post)
//Non-Simple Requests ( all other requests and sending cookies etc)
app.options('*', cors());
//for just specific routes
//app.options('/api/v1/tours', cors());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Global Midllewares


// Serving Static Files
app.use(express.static(path.join(__dirname, `public`)));

//Set Security Http Headers
app.use(helmet());

//Limiting No of request from the same IP
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too Many Requests from this IP. Plz tryagain in 1hr'
});
app.use('/api', limiter);

//For Stripe WebHooks (Put Before the body parser because we want this data not in json)
app.post('/webhook-checkout', bodyParser.raw({ type: 'application/json' }), bookingController.webhookCheckout);

//Body Parser Gets req.body
app.use(express.json({ limit: '10kb'}));
//Cookie Parser Get the Cookie from client
app.use(cookieParser());
//Body parser for Getting Data from Form
app.use(express.urlencoded({ extended: true, limit: '10kb'}))

//Data Sanitization SQL Injection
app.use(mongoSanitize());

//Data Sanitization Against XSS Attack
app.use(xss());

//Preventing Parameter Pollution
app.use(
    hpp({
        whitelist: [
            'duration',
            'ratingsQuantity',
            'ratingsAverage',
            'maxGroupSize',
            'difficulty',
            'price'
        ]
    })
);

app.use(compression());
app.use((req, res, next) => {
    req.requireTime = new Date().toISOString();
    next();
});

//Using 3rd Party middleware

//Routes
//Pug Routes


//APi Routes
//to use cors for a specific route than remove from above and add to only the route which we want to allow
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} in server`, 404));
});

app.use(globalErrorController);


module.exports = app;





