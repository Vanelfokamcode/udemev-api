const advancedResults = (Model, populate) => async (req, res, next) => {
  let query;

  const reqQuery = { ...req.query };

  // fields to exclude
  const removeField = ['select', 'sort', 'page', 'limit'];
  // loop over removeField and delete the field exclude
  removeField.forEach((param) => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);

  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // {"averageCost": {"$lt": "1000"}} before parse
  query = Model.find(JSON.parse(queryStr)).populate('courses');
  // query after being parse {averageCost: {$lt: 1000}}

  // Select fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // SORT
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query.sort('-createdAt');
  }

  // pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }
  // excuting the query
  const results = await query;

  // pagination result

  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit: limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit: limit,
    };
  }
  res.advancedResults = {
    status: 'success',
    count: results.length,
    pagination,
    data: results,
  };

  next();
};

module.exports = advancedResults;
