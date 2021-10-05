const User = require('./../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./controllerFactory');

const multer = require('multer');
const sharp = require('sharp');

//Uploding to Disk
// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     } 
// });

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

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync( async (req, res, next) => {
    if(!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer).resize(500, 500).toFormat('jpeg').jpeg({ quality: 90}).toFile(`public/img/users/${req.file.filename}`);
    next();
});

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}

exports.updateMe = catchAsync( async (req, res, next) => {

    //1.Create Error if User posts password or passwordConfirm
    if(req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password change. plz use /updatemypassword', 400));
    };

    const filteredObj = filterObj(req.body, 'email', 'name');
    if(req.file) filteredObj.photo = req.file.filename;

    // 2.Update Document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredObj, {
        new: true,
        runValidators:true
    });
    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {active: false});
    res.status(204).json({
        status: 'success',
        data: null
    });
});

//Genereted By factory Handler
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);  //Do not update Password with this
exports.deleteUser = factory.deleteOne(User);