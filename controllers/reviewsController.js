const Review = require('../models/ReviewsModel');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../models/BootcampsModel');
const ErrorResponse = require('../utils/errorResponse');

// @ desc      GET reviews
// @route      GET /api/v1/reviews
// @route      GET /api/v1/bootcamp/:bootcampId/courses
// @access     Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    // if id in url find the bootcamp for that id first
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });
    res.status(200).json({
      status: 'success',
      count: reviews.length,
      data: reviews,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @ desc      GET a single reviews
// @route      GET /api/v1/reviews/:reviewId
// @access     Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });
  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    status: 'success',
    data: review,
  });
});

// @ desc      Add a review to bootcamp
// @route      POST /api/v1/bootcamps/:bootcampId/reviews
// @access     Private
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp with the id of ${req.params.id}`, 404)
    );
  }
  // req.body will have the bootcamp and user id in it
  const review = Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      review,
    },
  });
});

// @ desc      Update review to bootcamp
// @route      PUT /api/v1/reviews/:id
// @access     Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }

  // make sure review belong to a user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorize to update this review', 401));
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

// @ desc      Delete review
// @route      DELETE /api/v1/reviews/:id
// @access     Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }

  // make sure review belong to a user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorize to update this review', 401));
  }

  await review.deleteOne();

  res.status(200).json({
    status: 'success',
    data: {},
  });
});
