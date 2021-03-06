const stripe = require('stripe')(process.env.STRIPE_SECRETKEY);
const Tour = require('./../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./controllerFactory');
const Booking = require('../models/bookingModel');
const User = require('../models/userModel');

exports.getCheckoutSession = catchAsync( async (req, res, next) => {
    //1. Get Tour For the Booking
    const tour = await Tour.findById(req.params.tourId);

    //2. Create Checkout Session
    const session = await stripe.checkout.sessions.create({
        //Information About Session
        payment_method_types: ['card'],
        //For Creating Bopkin without Stripe WebHooks
        // success_url: `${req.protocol}://${req.get('host')}//my-tours?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        success_url: `${req.protocol}://${req.get('host')}/my-tours`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        //Information About the Product
        line_items: [
            {
                name: `${tour.name} Tour`,
                description: tour.summary,
                images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
                amount: tour.price * 100,
                currency: 'usd',
                quantity: 1
            }
        ]
    });

    //3. Send Session as response
    res.status(200).json({
        status: 'success',
        session
    });
});

//For Creating Bopkin without Stripe WebHooks
// exports.createBoookingCheckout = catchAsync( async(req, res, next) => {
//     //This is only temporary because it is not safe 
//     const { tour, user, price} = req.query;

//     if(!tour && !user && !price) return next();

//     await Booking.create({ tour, user, price});

//     res.redirect(req.originalUrl.split('?')[0]);
// });

const createBoookingCheckout = catchAsync(async (session) => {
    const tour = session.client_reference_id;
    const user = (await User.findOne( { email: session.customer_details.email})).id;
    const price = session.line_items[0].amount / 100;
    await Booking.create({ tour, user, price});
}); 

exports.webhookCheckout = (req, res, next) => {
    const signature = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    }
    catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if(event.type === 'checkout.session.completed')
        const paymentIntent = event.data.object;
        createBoookingCheckout(paymentIntent);

    res.status(200).json({ received: true});
    
}

//Genereted By factory Handler
exports.getAllBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking, [{ path: 'user', select: 'name email'}, { path: 'tour', select: 'name'}]);
exports.createNewBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);