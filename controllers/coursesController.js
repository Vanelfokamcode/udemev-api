const Course = require('../models/coursesModel');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../models/BootcampsModel');
const ErrorResponse = require('../utils/errorResponse');

// @ desc      GET courses
// @route      /api/v1/courses
// @route      /api/v1/bootcamp/:bootcampId/courses
// @access     Public
exports.getAllCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    // if id in url find the bootcamp for that id first
    const courses = await Course.find({ bootcamp: req.params.bootcampId });
    res.status(200).json({
      status: 'success',
      count: courses.length,
      data: courses,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc      Get single course
// @route     GET /api/v1/courses/:id
// @access    Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });

  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @ desc      Add course
// @route      POST /api/v1/bootcamps/:bootcampId/courses
// @access     Private
exports.addCourse = asyncHandler(async (req, res, next) => {
  // the bootcamp is equal to the bootcampId in the URL
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;
  const bootcamp = Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    next(
      new ErrorResponse(
        `No bootcamp with the id of ${req.params.bootcampId}`,
        404
      )
    );
  }
  // make sur user is the owner of the bootcamp
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} not authorized to add course to this bootcamp ${bootcamp._id}`,
        404
      )
    );
  }
  // create the course for that bootcamp
  const course = Course.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      course: course,
    },
  });
});

// @ desc      Update course
// @route      PUT /api/v1/courses/:id
// @access     Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    next(new ErrorResponse(`No course with the id of ${req.params.id}`, 404));
  }
  // make sur user is the owner of the course
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} not authorized to update course ${course._id}`,
        404
      )
    );
  }
  course = Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: course,
  });
});

// @ desc      Delete course
// @route      DELETE /api/v1/courses/:id
// @access     Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    next(new ErrorResponse(`No course with the id of ${req.params.id}`, 404));
  }
  // make sur user is the owner of the course
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} not authorized to update course ${course._id}`,
        404
      )
    );
  }
  await course.deleteOne();

  res.status(200).json({
    status: 'success',
    data: {},
  });
});
