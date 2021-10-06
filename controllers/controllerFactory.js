const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAll = Model => catchAsync(async (req, res, next) => {
    //To Allow for nested Get Reviews on the Tour
    let filter = {};
    if(req.params.tourId) filter = { tour: req.params.tourId };


    //Execute Query
    const features = new APIFeatures(Model.find(filter), req.query)
    .filter()
    .sort()
    .limitFeilds()
    .paginate();

    const doc = await features.query;
    //Send Response
    res.status(200).json({
        status: 'success',
        results: doc.length,
        data: {
            data: doc
        }
    });
});
 
exports.getOne = (Model, populateOptions) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if(populateOptions) query = query.populate(populateOptions);

    const doc = await query;

    if(!doc) {
        return next(new AppError('No Tour Found with this ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    });
});

exports.createOne = Model => catchAsync(async (req, res, next) => { 
    const newDoc = await Model.create(req.body);
    res.status(200).json({
        status: 'success',
        data: {
            data: newDoc
        }
   });
});

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if(!doc) {
        return next(new AppError('No Tour Found with this ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    });
});

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if(!doc) {
            return next(new AppError('No Tour Found with this ID', 404));
    }
    res.status(204).json({
        status: 'success',
        data: null
    });
});