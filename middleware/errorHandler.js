const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // console err stack for dev
  console.log(err.stack.red);

  //   mongoose bad ID
  if (err.name === 'CastError') {
    const message = `Resource not found with the id of ${err.value}  `;
    error = new ErrorResponse(message, 404);
  }

  //   mongoose duplicate fields

  if (err.code === 11000) {
    const message = 'Duplicate value entered';
    error = new ErrorResponse(message, 400);
    // 400 bad request
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    status: 'failed',
    error: error.message || 'Server error',
  });
};

module.exports = errorHandler;
