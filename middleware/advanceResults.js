const advanceResults = (model, populate) => async(req,res,next) => {
    let query;

  //Copy req.query
  const reqQuery = { ...req.query };
  // console.log(reqQuery)

  //Fields to exclude so that it wont match as a field
  const removeFields = ["select", "sort", "page", "limit"];

  //Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  // console.log(reqQuery)
  //Create query string
  let queryStr = JSON.stringify(reqQuery);

  //wordboundry g = global search Create operator($gt, $gte. etc)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );
  //  console.log(queryStr)

  //Finding resource
  query = model.find(JSON.parse(queryStr))

  //Select Fields must have space mongoose
  if (req.query.select) {
    // console.log(req.query.select)
    const fields = req.query.select.split(",").join(" ");
    // console.log(fields)
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  //Pagination & radix parameter is used to specify which numeral system to be used
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  // console.log('page',page)
  const endIndex = page * limit;
  const total = await model.countDocuments();
  // console.log('total',total)

  query = query.skip(startIndex).limit(limit);

  if(populate) {
      query = query.populate(populate);
  }

  //Executing query
  const results = await query; //model.find()

  //Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.advanceResults = {
      success: true,
      count: results.length,
      pagination,
      data: results
  }

  next()

}
module.exports = advanceResults;