const path = require('path');
const Bootcamp = require('../models/BootcampsModel');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @ desc      GET all bootcamps
// @route      /api/v1/bootcamps
// @access     Public
exports.getAllBootcamp = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @ desc      GET single bootcamp
// @route      GET /api/v1/bootcamps/:id
// @access     Public

exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp not found with that ${req.params.id} id `,
        404
      )
    );
  }
  res.status(201).json({
    status: 'Success',
    data: {
      bootcamp,
    },
  });
});

// @ desc      CREATE a bootcamp
// @route      POST /api/v1/bootcamps
// @access     Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // Add user on the req.body
  req.body.user = req.user.id;

  // check for published bootcamp by a certain user
  const publishedBootcamp = User.findOne({ user: req.user.id });

  // if user not admin they can only published one bootcamp
  if (publishedBootcamp && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `The user with ID ${req.user.id} has already published a bootcamp`,
        400
      )
    );
  }
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({
    status: 'Success',
    data: {
      bootcamp,
    },
  });
});

// @ desc      UPDATE a bootcamp
// @route      PUT /api/v1/bootcamps/:id
// @access     Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    next(
      new ErrorResponse(
        `Bootcamp not found with that ${req.params.id} id `,
        404
      )
    );
  }

  // make sur user is the owner of the bootcamp
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} not authorized to update this bootcamp`,
        404
      )
    );
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(201).json({
    status: 'Success',
    data: {
      bootcamp,
    },
  });
});

// @ desc      DELETE a bootcamp
// @route      DELETE /api/v1/bootcamps/:id
// @access     Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    next(
      new ErrorResponse(
        `Bootcamp not found with that ${req.params.id} id `,
        404
      )
    );
  }
  // make sur user is the owner of the bootcamp
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} not authorized to delete this bootcamp`,
        404
      )
    );
  }

  bootcamp.deleteOne();
  res.status(200).json({
    status: 'success',
  });
});

// @ desc      Upload a photo for a bootcamp
// @route      PUT /api/v1/bootcamps/:id/photo
// @access     Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    next(
      new ErrorResponse(
        `Bootcamp not found with that ${req.params.id} id `,
        404
      )
    );
  }
  // make sur user is the owner of the bootcamp
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} not authorized to upload photo this bootcamp`,
        404
      )
    );
  }
  if (!req.files) {
    return next(new ErrorResponse(`please upload a file`, 400));
  }

  // to make sure the file uploaded is an image or photo
  const file = req.files.file;
  if (!file.mimetype.startsWith('image')) {
    next(new ErrorResponse(`please upload a photo`, 400));
  }

  // check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `please upload a photo less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // create a custom file name
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    console.error(err);

    if (err) {
      return next(new ErrorResponse(`problem with file upload`, 500));
    }
    await Bootcamp.findById(req.params.id, {
      photo: file.name,
    });
  });
  res.status(200).json({
    status: 'success',
    data: file.name,
  });
});
