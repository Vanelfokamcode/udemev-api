const express = require('express');
const colors = require('colors');
const morgan = require('morgan');
const dotenv = require('dotenv');

const connectDB = require('./config/db');

dotenv.config({ path: './config/config.env' });

// CONNECT DB
connectDB();

const bootcampRoutes = require('./routes/bootcampsRoute');

const app = express();

// Body parser
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1/bootcamps', bootcampRoutes);

const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT,
  console.log(
    `Server running on ${process.env.NODE_ENV} mode on ${PORT}`.yellow.bold
  )
);

// handle unhandled promises rejections
server.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);

  // close & exit server
  server.close(() => process.exit(1));
});
