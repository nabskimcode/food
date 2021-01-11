const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const geocoder = require("../utils/geocoder");
const Order = require("../models/Orders");
const asyncHandler = require("../middleware/async");

// @desc   Get all orders
// @route  GET /api/v1/orders
// @access Public
exports.getOrders = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advanceResults);
});

// @desc   Get single order
// @route  GET /api/v1/order/:id
// @access Public
exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    //    return res.status(400).json({success: false});
    return next(
      new ErrorResponse(`Order not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: order });
});

// @access Private
exports.createOrder = asyncHandler(async (req, res, next) => {
  // add user to req.body
  req.body.user = req.user.id;

  const publishedOrder = await Order.findOne({ user: req.user.id });

  // if the user is not an admin, they can only add one order
  if (publishedOrder && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `The user with ID ${req.user.id} has already published order`,
        400
      )
    );
  }

  const order = await Order.create(req.body);

  res.status(201).json({
    success: true,
    data: order,
  });
});

// @access Private
exports.updateOrder = asyncHandler(async (req, res, next) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = Object.keys(Oder.schema.paths);
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  let order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      new ErrorResponse(`Order not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is order owner
  if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update this order`,
        401
      )
    );
  }

  order = await Order.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: order });
});

// @desc   Delete single order
// @access Private
exports.deleteOrder = asyncHandler(async (req, res, next) => {
  //findByIdandDelete doesnt trigger the pre delete mongoose middleware
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      new ErrorResponse(`order not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is order owner
  if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to delete this order`,
        401
      )
    );
  }

  order.remove();
  res.status(200).json({ success: true, data: {} });
});

// @desc   Get order within a radius
// @route  GET /api/v1/orders/radius/:zipcode/:distance
// @access Private
exports.getordersInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  //Get lat/lang from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  //Calculate radius using radians
  //Divide dist by radius of Earth
  // Earth Radius = 3,963 mi / 6,378.1 km

  const radius = distance / 3963;

  const orders = await Order.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
});
