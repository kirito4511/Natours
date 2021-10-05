const AppError = require('../utils/appError')

const handleDBCastError = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 404);
}

const handleDBDuplicateFields = (err) => {
    const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
    

    const message = `Duplicate Field Value: ${value}. Use another Value`;
    return new AppError(message, 400);
}

const handleDBValidationError = (err) => {
    const errors = Object.values(err.errors).map(el => el.message)
    const message = `Invalid Input Data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const handleJWTError = () => {
    return new AppError('Invalid Token. Plz Log In Again', 401)
};

const handleJWTExpiredError = () => {
    return new AppError('Expired Token. Plz Log In Again', 401)
}

const sendErrorDev = (err, req, res) => {
    //For Api
    if(req.originalUrl.startsWith('/api')) {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } else {
        //For Rendering Pages
        console.log('Error...', err);
        res.status(err.statusCode).render('error', {
            title: 'Something went wrong',
            msg: err.message
        });
    }
    
}

const sendErrorProd = (err, req, res) => {
    // API
    if(req.originalUrl.startsWith('/api')) {
        if(err.isOperational) {
            return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
            });
        }
        console.log('Error...', err);
        return res.status(500).json({
            status: 'error',
            message: 'Something went very worng'
        });
    }
    //Render Website
    if(err.isOperational) {
        return res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: err.message
        });
    }
    console.log('Error...', err);
    return res.status(res.statusCode).render('error', {
        title: 'Something went wrong',
        msg: 'Plz Try Again Later'
    });
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if(process.env.NODE_ENV == 'development'){
        sendErrorDev(err, req, res);
    } else if(process.env.NODE_ENV == 'production') {
        let error = {...err};
        error.message = err.message;

        if(err.name ===  'CastError') error = handleDBCastError(error);
        if(err.code ===  11000) error = handleDBDuplicateFields(error);
        if(err.name ===  'ValidationError') error = handleDBValidationError(error);
        if(err.name ===  'JsonWebTokenError') error = handleJWTError();
        if(err.name ===  'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, req, res);
    }
};