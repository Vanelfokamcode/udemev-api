const express = require('express');
const colors = require('colors');
const path = require('path');
const morgan = require('morgan');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongosanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/errorHandler');

dotenv.config({ path: './config/config.env' });

const connectDB = require('./config/db');

// CONNECT DB
connectDB();

const bootcampRoutes = require('./routes/bootcampsRoute');
const coursesRoutes = require('./routes/coursesRoute');
const authRoutes = require('./routes/authRoutes');
const usersRoutes = require('./routes/usersRoutes');
const reviewsRoutes = require('./routes/reviewsRoutes');

const app = express();

// Body parser
app.use(express.json());

// cookie parser
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// file uploading
app.use(fileupload());

// sanitize data
app.use(mongosanitize());

// set security headers
app.use(helmet());

// prevent cross-site scripting
app.use(xss());

// rate limiting request
const limiter = rateLimit({
  // 100 max for 100 request
  windowMs: 10 * 60 * 1000,
  max: 100,
});
app.use(limiter);

//Prevent http param pollution
app.use(hpp());

// enable CORS
app.use(cors());

// static folder: Our main page ('/' refers to public ) is now public
app.use(express.static(path.join(__dirname, 'public')));

// for the routes
app.use('/api/v1/bootcamps', bootcampRoutes);
app.use('/api/v1/courses', coursesRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/reviews', reviewsRoutes);

// error handler
app.use(errorHandler);

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
