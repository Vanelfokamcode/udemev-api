const express = require('express');
const bootcampsController = require('../controllers/bootcampsController');
const auth = require('../middleware/auth');
const Bootcamp = require('../models/BootcampsModel');

// Include other resources routers
const coursesRoute = require('./coursesRoute');

const advancedResults = require('../middleware/advancedResults');

const router = express.Router();

// Re-route into other resource routers
router.use('/:bootcampId/courses', coursesRoute);
router
  .route('/:id/photo')
  .put(
    auth.protect,
    auth.authorize('publisher', 'admin'),
    bootcampsController.bootcampPhotoUpload
  );

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), bootcampsController.getAllBootcamp)
  .post(
    auth.protect,
    auth.authorize('publisher', 'admin'),
    bootcampsController.createBootcamp
  );

router
  .route('/:id')
  .get(bootcampsController.getBootcamp)
  .put(
    auth.protect,
    auth.authorize('publisher', 'admin'),
    bootcampsController.updateBootcamp
  )
  .delete(
    auth.protect,
    auth.authorize('publisher', 'admin'),
    bootcampsController.deleteBootcamp
  );

module.exports = router;
