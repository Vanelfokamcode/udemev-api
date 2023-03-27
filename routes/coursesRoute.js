const express = require('express');
const mongoose = require('mongoose');
const coursesController = require('../controllers/coursesController');

// const Course = require('../models/CoursesModel');
var Course = mongoose.model('Course');
const auth = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');

router
  .route('/')
  .get(advancedResults(Course, 'bootcamp'), coursesController.getAllCourses)
  .post(
    auth.protect,
    auth.authorize('publisher', 'admin'),
    coursesController.addCourse
  );
router
  .route('/:id')
  .get(coursesController.getCourse)
  .put(
    auth.protect,
    auth.authorize('publisher', 'admin'),
    coursesController.updateCourse
  )
  .delete(
    auth.protect,
    auth.authorize('publisher', 'admin'),
    coursesController.deleteCourse
  );

module.exports = router;
