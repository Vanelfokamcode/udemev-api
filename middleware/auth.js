const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/UsersModel');
const asyncHandler = require('./async');

exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    // set token from cookie
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  //   Make sure the token exists
  if (!token) {
    next(new ErrorResponse('Not authorized to access this route', 401));
  }
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Log the decoded token for debugging
    console.log('Decoded token:', decoded);

    // Currently logged-in user
    const user = await User.findById(decoded.id);

    // Log the user object for debugging
    console.log('User object:', user);

    if (!user) {
      return next(new ErrorResponse('No user found with this id', 404));
    }

    req.user = user;
    next();
  } catch (err) {
    // return next(new ErrorResponse('Not authorized to access this route', 401));
    console.error(err);
    next();
  }
});

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.log(
        `User role ${req.user.role} is not authorized to access this route`
      );
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    console.log(
      `User role ${req.user.role} is authorized to access this route`
    );
    next();
  };
};
