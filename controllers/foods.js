const ErrorResponse = require("../utils/errorResponse");
const Food = require("../models/Foods");
const asyncHandler = require("../middleware/async");
const Order = require("../models/Orders");
const path = require("path");

exports.getFoods = asyncHandler(async (req, res, next) => {
  // let query;

  if (req.params.foodId) {
    const foods = await Food.find({ order: req.params.foodId });
    return res.status(200).json({
      success: true,
      count: foods.length,
      data: foods,
    });
  } else {
    res.status(200).json(res.advanceResults);
  }
});

// @desc   Get single food
// @route  GET /api/v1/food/:id
exports.getFood = asyncHandler(async (req, res, next) => {
  const food = await Food.findById(req.params.id).populate({
    path: "order",
    select: "title description",
  });

  if (!food) {
    return next(
      new ErrorResponse(`No food with the id of ${req.params.id}`),
      404
    );
  }

  res.status(200).json({
    success: true,
    data: food,
  });
});

// @desc   Add food
// @access Private

exports.addFood = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;

  if (req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to add a food ${food._id}`,
        401
      )
    );
  }

  const food = await Food.create(req.body);

  res.status(200).json({
    success: true,
    data: food,
  });
});

exports.updateFood = asyncHandler(async (req, res, next) => {
  let food = await Food.findById(req.params.id);

  if (!food) {
    return next(
      new ErrorResponse(`No food with the id of ${req.params.id}`),
      404
    );
  }

  if (food.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update food ${food._id}`,
        401
      )
    );
  }

  food = await Food.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: food,
  });
});

// @desc   Delete food

exports.deleteFood = asyncHandler(async (req, res, next) => {
  const food = await Food.findById(req.params.id);

  if (!food) {
    return next(
      new ErrorResponse(`No food with the id of ${req.params.id}`),
      404
    );
  }

  if (food.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete food ${food._id}`,
        401
      )
    );
  }

  await food.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc   Upload photo for food
// @route  PUT /api/v1/food/:id/photo
// @access Private
exports.foodPhotoUpload = asyncHandler(async (req, res, next) => {
  const food = await Food.findById(req.params.id);

  if (!food) {
    return next(
      new ErrorResponse(`Food not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is food owner
  if (food.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to delete this food`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  //   console.log(req.files)
  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // cHECK file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than 
        ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `photo_${order._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await order.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
