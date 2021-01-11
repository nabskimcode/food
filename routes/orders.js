const express = require("express");
const router = express.Router();

const {
  getOrder,
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  getordersInRadius,
} = require("../controllers/orders");

const Food = require("../models/Foods");

// Include other resource routers
const foodRouter = require("./foods");

const advanceResults = require("../middleware/advanceResults");
const { protect, authorize } = require("../middleware/auth");

// Re-route into other resource routers anything that hits the url path will be forwarded to the callback router
router.use("/:orderId/foods", foodRouter);

router.route("/radius/:zipcode/:distance").get(getordersInRadius);

router
  .route("/")
  .get(advanceResults(Food, "foods"), getOrders)
  .post(protect, authorize("publisher", "admin"), createOrder);

router
  .route("/:id")
  .get(getOrder)
  .put(protect, authorize("publisher", "admin"), updateOrder)
  .delete(protect, authorize("publisher", "admin"), deleteOrder);

module.exports = router;
