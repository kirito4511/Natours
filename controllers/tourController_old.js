// const fs = require('fs');

// //Reading Json Data from File Using ReadfileSync Function
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

// exports.checkBody = (req, res, next) => {
//     if(!req.body.name || !req.body.price) {
//         return res.status(404).json({
//         status: 'Failed',
//         message: 'Name or Price not Present'
//         });
//     }
//     next();
// };

// exports.checkID = (req, res, next, val) => {
//     if(val > tours.length) {
//         return res.status(404).json({
//         status: 'Failed',
//         message: 'Data Not Found'
//         });
//     }
//     next();
// };


// //Tours Route Handlers
// exports.getAllTours = (req, res) => {
//     res.status(200).json({
//         status: 'success',
//         requestedAt: req.requireTime,
//         result: tours.length,
//         data: {
//             tours
//         }
//     });
// };

// exports.createNewTour = (req, res) => {

//     //Creating New ID for the New Tour To be Added
//     const newID = tours[tours.length - 1].id + 1;

//     //Creating New Tour with the newID and the Body sent in the Request
//     const newTour = Object.assign({id: newID}, req.body);

//     tours.push(newTour);

//     fs.writeFile(`${__dirname}/../dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
//         res.status(201).json({
//             status: 'success',
//             data: {
//                 tour: newTour
//             }
//         });
//     });
// };

// exports.getTour = (req, res) => {
//     //Getting id from the url "/:id"
//     const urlID = req.params.id * 1;

//     //Getting and Saving Single Tour Data
//     const tour = tours.find(el => el.id === urlID);
    

//     res.status(200).json({
//         status: 'success',
//         data: {
//             tour
//         }
//     });
// };

// exports.updateTour = (req, res) => {
//     //Getting id from the url "/:id"
//     const urlID = req.params.id * 1;

//     //Getting and Saving Single Tour Data
//     let tourToUpdate = tours.find(el => el.id === urlID);

//     //Creating New Tour with the newID and the Body sent in the Request
//     tourToUpdate = Object.assign(tourToUpdate, req.body);

//     fs.writeFile(`${__dirname}/../dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
//         res.status(201).json({
//             status: 'success',
//             data: {
//                 updatedTour: tourToUpdate
//             }
//         });
//     });
// };

// exports.deleteTour = (req, res) => {
//     res.status(204).json({
//             status: 'success',
//             data: null
//     });
// };