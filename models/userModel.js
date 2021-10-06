const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A User must have a name']
    },
    email: {
        type: String,
        required: [true, 'A User must have an email'],
        unique: true,
        validate: [validator.isEmail, 'Plz provide a valid email']
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String,
        // default: 'user',
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user',
    },
    password: {
        type: String,
        required: [true, 'A User must have a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Plz confirm your password'],
        validate: [function(el) {
            return el === this.password; //works only on .create() and .save()
        }, 'password are not same']
    },
    passwordChangedAt: Date,
    resetPasswordToken: String,
    resetPasswordTokenExpires: Date,
    active: {
        type: Boolean,
        defualt: true,
        select: false
    }
});

//Hasing password before saving it to the DB
userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next();

    //Hashing Password with the cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
});

//Setting passwordChangedAt property only when password is changed
userSchema.pre('save', async function(next) {
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
});

userSchema.pre(/^find/, async function(next) {
    this.find({active: {$ne: false}});
    next();
});
//Comparing the user and DB passwords if they are correct
userSchema.methods.correctPassword = async (candidatePassword, userPassword) => {
    return await bcrypt.compare(candidatePassword, userPassword);
};

//Checking if the Password was changed after User was logged in
userSchema.methods.changedPasswordAfter = function(JWTTimeStamp) {
    if(this.passwordChangedAt) {
        const changedPasswordTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimeStamp < changedPasswordTimeStamp;
    };

    //Password not Changed
    return false;
};

//Creating Password Rest Token and Expiry Time for the Reset Token
//And Sending token via email to the user
//Also Hashing the Reset Token and saving that to the DB
userSchema.methods.createResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordTokenExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};


//Creating User Model
const User = mongoose.model('User', userSchema);

module.exports = User; 