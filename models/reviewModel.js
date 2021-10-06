const mongoose = require('mongoose');
const Tour = require('./tourModel')

const reviewsSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review can not be empty!']
    },
    rating: {
        type: Number,
        min: [1, 'Rating must be atleast 1'],
        max: [5, 'Rating can not be above 5']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'A review must belong to a User']
    },
    tour:{
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'A review must have belong to a Tour']
    }
},
{
        toJSON: { virtuals: true},
        toObject: { virtuals: true}
});

reviewsSchema.index({tour: 1, user: 1}, {unique: true});

reviewsSchema.pre(/^find/, function(next) {
    // this.populate([
    //     {
    //         path: 'user',
    //         select: 'name photo'
    //     },
    //     {
    //         path: 'tour',
    //         select: 'name'
    //     }
    // ]);

    this.populate({
        path: 'user',
        select: 'name photo'
    });
    next();
});

reviewsSchema.statics.calcAverageRatings = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match: {tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                nRatings: { $sum: 1},
                avgRating: { $avg: '$rating'}
            }
        }
    ]);
    if(stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRatings,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }
};

reviewsSchema.post('save', function() {
    this.constructor.calcAverageRatings(this.tour);
});

reviewsSchema.pre(/^findOneAnd/, async function(next) {
    this.r = await this.findOne();
    next()
});

reviewsSchema.post(/^findOneAnd/, async function() {
    await this.r.constructor.calcAverageRatings(this.r.tour);
});


const Review = mongoose.model('Review', reviewsSchema);

module.exports = Review; 