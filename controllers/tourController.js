const Tour = require('./../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./controllerFactory')

const multer = require('multer');
const sharp = require('sharp');

//Uploading to the Ram So to Perform Image Processing (like Resizing etc)
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an Image! Plz Upload only Image files', 400), false);
    };
};


const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

// exports.uploadTourImages =  upload.single() (for single image (or any other file type))
// exports.uploadTourImages =  upload.array() (for Multiple images (or any other file type))
//(for multiple files)
exports.uploadTourImages =  upload.fields([
    {
        name: 'imageCover',
        maxCount: 1        
    },
    {
        name: 'images',
        maxCount: 3
    }
]);

exports.resizeTourImages = catchAsync( async (req, res, next) => {
    if(!req.files.imageCover || !req.files.images) return next();

    //1. Cover Images
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90})
        .toFile(`public/img/tours/${req.body.imageCover}`);

    //2. Images
    req.body.images = [];
    await Promise.all(req.files.images.map( async (file, i) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`;
        await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90})
        .toFile(`public/img/tours/${filename}`);

        req.body.images.push(filename);
    }));
    next();
});


//AlaisRoute Handler
exports.alaisTour = (req,res, next) => {
    req.query.limit = '5';
    req.query.sort = 'price,ratingsAverage';
    req.query.fields = 'name,price,ratingsAverage,summary' ;
    next();
} 


//Genereted By factory Handler
exports.getAllTours = factory.getAll(Tour);
exports.createNewTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews'}) 

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: {ratingsAverage: { $gte: 4.5 }}
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty'},
                sumTours: { $sum: 1},
                sumRatings: { $sum: '$ratingsQuantity'},
                avgRatings: { $avg: '$ratingsAverage'},
                avgPrice: { $avg: '$price'},
                minPrice: { $min: '$price'},
                maxPrice: { $max: '$price'}
            }
        },
        {
            $sort: { avgPrice: 1}
        },
        // {
        //     $match: { _id: { $ne: 'EASY'}}
        // }
    ]);
    res.status(200).json({
        status: 'success',
        data: stats
    });
});

exports.getMonthTour = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates'},
                numTourStart: { $sum: 1 },
                tours: { $push: '$name'}
            }
        },
        {
            $addFields: { month: '$_id'}
        },
        {
            $project: { _id: 0}
        },
        {
            $sort: { numTourStart: -1}
        },
        // {
        //     $limit: 6
        // }
    ]);
    res.status(200).json({
        status: 'success',
        data: plan
    });
});

exports.getToursWithIn = catchAsync( async (req, res, next) => {
    const {distance, latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',');
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if(!lat || !lng) {
        next(new ApError('Please provide Latitude and Longitudein the format lat,lng', 400));
    };

    const tours = await Tour.find(
        { startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius]}}}
    );

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours
        }
    })
});

exports.getToursDistances = catchAsync( async (req, res, next) => {
    const {latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if(!lat || !lng) {
        next(new ApError('Please provide Latitude and Longitudein the format lat,lng', 400));
    };

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ])

    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
    })
});