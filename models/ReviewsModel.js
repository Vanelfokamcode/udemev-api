const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a title for the review'],
    maxlength: 100,
  },
  text: {
    type: String,
    required: [true, 'Please add some text'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Please a rating between 1 and 10'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});
//prevent to have Only one review per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

// statics method to get average rating of a bootcamp
ReviewSchema.statics.getAverageCost = async function (bootcampId) {
  const obj = this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: '$bootcamp',
        averageRating: { $avg: '$rating' },
      },
    },
  ]);
  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageRating: obj[0].averageRating,
    });
  } catch (err) {
    console.log(err);
  }
};
// getAverageCost after saving
ReviewSchema.post('save', function (bootcampId) {
  this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model('Review', ReviewSchema);
