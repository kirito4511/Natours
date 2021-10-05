const express = require('express');
const usersController = require('./../controllers/userController');
const authController = require('./../controllers/authController');


const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.get('/logout', authController.logout);


router.post('/forgotpassword', authController.forgotPassword);
router.patch('/resetpassword/:token', authController.resetPassword);

//All The Routes That come after this middleware will be protected
router.use(authController.protect);

router.patch('/updatemypassword', authController.updateMyPassword);
router.get('/me', usersController.getMe, usersController.getUser);
router.patch('/updateme', usersController.uploadUserPhoto, usersController.resizeUserPhoto, usersController.updateMe);
router.delete('/deleteme', usersController.deleteMe);

//All The Routes That come after this middleware will be retricted and accessed only by admin
router.use(authController.restrictTo('admin'));

router
.route('/')
.get(usersController.getAllUsers);
router
.route('/:id')
.get(usersController.getUser)
.patch(usersController.updateUser)
.delete(usersController.deleteUser);

module.exports = router;