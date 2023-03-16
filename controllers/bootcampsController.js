const Bootcamp = require('../models/BootcampsModel');
// @ desc      GET all bootcamps
// @route      /api/v1/bootcamps
// @access     Public

exports.getAllBootcamp = async (req, res, next) => {
  const bootcamps = await Bootcamp.find();
  res.status(200).json({
    status: 'Success',
    results: bootcamps.length,
    data: {
      bootcamps,
    },
  });
};

// @ desc      GET single bootcamp
// @route      GET /api/v1/bootcamps/:id
// @access     Public

exports.getBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
      return res.status(400).json({
        status: 'failed',
      });
    }
    res.status(201).json({
      status: 'Success',
      data: {
        bootcamp,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
    });
  }
};

// @ desc      CREATE a bootcamp
// @route      POST /api/v1/bootcamps
// @access     Private
exports.createBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({
      status: 'Success',
      data: {
        bootcamp,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
    });
  }
};

// @ desc      UPDATE a bootcamp
// @route      PUT /api/v1/bootcamps/:id
// @access     Private
exports.updateBootcamp = async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!bootcamp) {
    return res.status(400).json({
      status: 'failed',
    });
  }

  res.status(201).json({
    status: 'Success',
    data: {
      bootcamp,
    },
  });
};

// @ desc      DELETE a bootcamp
// @route      DELETE /api/v1/bootcamps/:id
// @access     Private
exports.deleteBootcamp = async (req, res, next) => {
  await Bootcamp.findByIdAndDelete(req.params.id);
  res.status(204).json({});
};
