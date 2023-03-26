const express = require('express');
const coursesController = require('../controllers/coursesController');

// const Course = require('../models/CoursesModel');
const auth = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');

router
  .route('/')
  .get(
    // advancedResults(Course, {
    //   path: 'bootcamp',
    //   select: 'name description',
    // }),
    coursesController.getAllCourses
  )
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
