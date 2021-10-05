const express = require('express');
const toursController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./reviewRouter');

const router = express.Router();

//Nested Routes (Route for creating reviews on a sepcific tour)
router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-cheap').get(toursController.alaisTour, toursController.getAllTours);
router.route('/tour-stats').get(toursController.getTourStats);
router.route('/monthly-plan/:year')
.get(authController.protect,
     authController.restrictTo('admin', 'lead-guide', 'guide'), 
     toursController.getMonthTour);
router
.route('/tours-within/:distance/center/:latlng/unit/:unit')
.get(toursController.getToursWithIn);
router
.route('/distances/:latlng/unit/:unit')
.get(toursController.getToursDistances);

router
.route('/')
.get(toursController.getAllTours)
.post(authController.protect, 
     authController.restrictTo('admin', 'lead-guide'), 
     toursController.createNewTour);
    
router
.route('/:id')
.get(toursController.getTour)
.patch(authController.protect,
     authController.restrictTo('admin', 'lead-guide'),
     toursController.uploadTourImages,
     toursController.resizeTourImages, 
     toursController.updateTour
     )
.delete(authController.protect,
     authController.restrictTo('admin', 'lead-guide'),
     toursController.deleteTour
     );


module.exports = router;