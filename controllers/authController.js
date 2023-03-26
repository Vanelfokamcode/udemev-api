const User = require('../models/UsersModel');
const sendEmail = require('../utils/sendEmail');
const ErrorResponse = require('../utils/errorResponse');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../middleware/async');
const crypto = require('crypto');
// Get Token from model, create cookie and send a response
const sendTokenResponse = (user, statusCode, res) => {
  //   create TOKEN
  const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  };

  const token = signToken(user._id);

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode).cookie('token', token, options).json({
    status: 'success',
    token,
  });
};

// @ desc      Register user
// @route      POST /api/v1/auth/register
// @access     Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = User.create({
    name,
    email,
    password,
    role,
  });

  sendTokenResponse(user, 200, res);
});

//@ desc       LOGIN user
// @route      POST /api/v1/auth/register
// @access     Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //   validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  //   check user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // check if password matches with the password from the body
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

//@ desc       Get current loged in user
// @route      GET /api/v1/auth/me
// @access     Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    status: 'success',
    data: user,
  });
});

//@ desc       Update user detail
// @route      PUT /api/v1/auth/updatedetails
// @access     Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const updateFields = {
    name: req.body.name,
    email: req.body.email,
  };
  const user = await User.findByIdAndUpdate(req.user.id, updateFields, {
    new: truen,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: user,
  });
});

//@ desc       Update password
// @route      PUT /api/v1/auth/updatepassword
// @access     Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Incorrect password', 401));
  }
  req.user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

//@ desc       Forgot password
// @route      GET /api/v1/auth/forgotpassword
// @access     Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // get reset password token
  const resetToken = user.getResetPasswordToken();

  // Create reset Url
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You receiving this email because you(or someone else) 
  has requested a reset of a password.Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Reset password token',
      message,
    });
  } catch (err) {
    // if something went wrong get rid of resetPasswordToken
    // and resetPasswordExpire field then save user in DB
    console.error(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.save({ runValidatorBeforeSave: false });
    return next(new ErrorResponse('Email could not be sent', 500));
  }
  res.status(200).json({
    status: 'success',
    data: 'e-mail sent',
  });
});

//@ desc       Reset Password
// @route      PUT /api/v1/auth/resetpassword/:resettoken
// @access     Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hash token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  // find user by the token in the DB
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid Token', 400));
  }

  // set new password so we do not need
  // the resetPasswordToken & resetPasswordExpire field
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});
