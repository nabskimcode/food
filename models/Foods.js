const mongoose = require("mongoose");

const FoodSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add a food title"],
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  price: {
    type: Number,
    required: [true, "Please add food cost"],
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity can not be less then 1."],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  photo: {
    type: String,
    default: "no-photo.jpg",
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Foods", FoodSchema);
