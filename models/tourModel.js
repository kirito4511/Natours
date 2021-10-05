const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');
//const User = require('./../controllers/userController');// Used for embedding Guides into tour

// Creating Schema
const toursSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a Name'],
        unique: true,
        trim: true,
        maxlength: [40, 'A tour name must have less or equal to 40 charachters'],
        minlength: [10, 'A tour name must have more or equal to 10 charachters']
    },
    slug: String,   
    duration: {
        type: Number,
        required: [true, 'A tour must have a Duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a Group Size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a Difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty Can not be other Than easy, mediun or difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be atleast 1'],
        max: [5, 'Rating can not be above 5'],
        set: val => math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a Price']
    },
    priceDiscount: {
        type: Number,
        //This only works for creation and not updation
        validate: {
            validator: function(val) {
            return val < this.price;
            },
            message: 'Discounted price ({VALUE}) should be lower than regular price'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a summary']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a Cover Image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    //guides: Array //1. Embedding Guides into the Tour Document
    //2. Child refrencing
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
},
{
        toJSON: { virtuals: true},
        toObject: { virtuals: true}
});

//Indexs for executing queries faster
toursSchema.index({
    price: 1,
    ratingsAverage: -1
});
toursSchema.index({ slug: 1});

//Index for GeoSpatial Data
toursSchema.index({ startLocation: '2dsphere'})

toursSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
});

//Virtual Populate
toursSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id',
    options: {
        select: '-__v'
    }
});

//Document Middleware (Are only called when .save() or .create() is used)
//1. Pre (Before) Saving a Document
toursSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true});
    next();
});

// // Embedding Tour Guides into tours
// toursSchema.pre('save', async function(next) {
//     const guidesPromises = this.guides.map( async id => await  User.findById(id));
//     this.guides = await Promise.all(guidesPromises);
//     next();
// });

// //2. Post (After Saving a Document)
// toursSchema.post('save', function(doc, next) {
//     console.log(doc);
//     next();
// });

//Query MiddleWare (Are called when A Query is exectuted)
//1. Pre
// toursSchema.pre('find', function(next) {
toursSchema.pre(/^find/, function(next) {
    this.find({ secretTour: { $ne: true}});
    this.start = Date.now();
    next();
});

toursSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'guides',
        select: '-_v,-passwordChangedAt'
    });
    next();
});

// //2. Post
// toursSchema.post(/^find/, function(docs, next) {
//     console.log(`Query Took ${Date.now() - this.start} milliSecounds`);
//     next();
// });

//Aggregation MiddleWare (Called When An Aggregation is being Done)
// toursSchema.pre('aggregate', function(next) {
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true}}});
//     next();
// });

////////////////There is No need For Post aggregation MiddleWare Also There is Model MiddleWare but not Important////////////////////////////////////////////////////////////////////////

// Creating Model
const Tour = mongoose.model('Tour', toursSchema);

module.exports = Tour;