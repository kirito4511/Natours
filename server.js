const mongoose = require('mongoose');
const dotenv = require('dotenv');

//Handling Uncaught Exception
process.on('uncaughtException', err => {
    console.log(`Uncaught Exception: Shutting Down`);
    console.log(err.name, err.message)
    process.exit(1);
});

// Connecting to config.env file
dotenv.config({ path: './config.env'});
console.log(process.env.NODE_ENV);
const app = require('./app');

// Connecting to Atlas (MongoDB)
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB).then(() => console.log('DB Connection Successful...'));

// Port Variable from config.env
const port = process.env.PORT || 1234;
// Starting Server
const server = app.listen(port, () => {
    console.log('Server Started...')
});

//Handling Unhandeled Promise Rejections
process.on('unhandledRejection', err => {
    console.log(`Unhandled Rejection: Shutting Down`);
    console.log(err.name, err.message)
    server.close(() => {
    process.exit(1);
    });
});

process.on('SIGTERM', () => {
    console.log('SIGTERM RECIVED. Shutting Down...');
    server.close(() => {
        console.log('Process Terminated');
    });
});