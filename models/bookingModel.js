const mongoose = require('mongoose');


// Creating Schema
const bookingSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'A booking must belong to a Tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A booking must belong to a User']
    },
    price: {
        type: Number,
        required: [true, 'A booking must have a Tour']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paid: {
        type: Boolean,
        default: true
    }
});


bookingSchema.pre(/^fiind/, function (next) {
    this.populate([
        {
            path: 'user'
        },
        {
            path: 'tour',
            select: 'name'
        }
    ]);
    next();
});


// Creating Model
const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;