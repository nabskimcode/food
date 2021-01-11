const express = require("express");

const {
  getFood,
  getFoods,
  addFood,
  updateFood,
  deleteFood,
  foodPhotoUpload,
} = require("../controllers/foods");

const router = express.Router({ mergeParams: true });

const advanceResults = require("../middleware/advanceResults");
const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .get(getFoods)
  .post(protect, authorize("publisher", "admin"), addFood);

router
  .route("/:id")
  .get(getFood)
  .put(protect, authorize("publisher", "admin"), updateFood)
  .delete(protect, authorize("publisher", "admin"), deleteFood);

router
  .route("/:id/photo")
  .put(protect, authorize("publisher", "admin"), foodPhotoUpload);

module.exports = router;
