const express = require('express');
const reviewsController = require('../controllers/reviewsController');

const Review = require('../models/ReviewsModel');

const router = express.Router({ mergeParams: true });

const auth = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');

router
  .route('/')
  .get(advancedResults(Review, 'bootcamp'), reviewsController.getReviews)
  .post(
    auth.protect,
    auth.authorize('user', 'admin'),
    reviewsController.addReview
  );

router
  .route('/:id')
  .get(reviewsController.getReview)
  .put(
    auth.protect,
    auth.authorize('user', 'admin'),
    reviewsController.updateReview
  )
  .delete(
    auth.protect,
    auth.authorize('user', 'admin'),
    reviewsController.deleteReview
  );
module.exports = router;
