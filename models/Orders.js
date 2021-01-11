const mongoose = require("mongoose");
const slugify = require("slugify");
const geocoder = require("../utils/geocoder");

const OrderSchema = new mongoose.Schema(
  {
    total_amount: { type: Number, required: true },
    slug: String,
    description: {
      type: String,
      required: [true, "Please add a description"],
      maxlength: [500, "Description can not be more than 500 characters "],
    },
    phone: {
      type: String,
      maxlength: [20, "Phone number can not be longer than 20 characters"],
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    location: {
      // GeoJSON Point
      type: {
        type: String,
        enum: ["Point"],
        // required: true,
      },
      coordinates: {
        type: [Number],
        // required: true,
        index: "2dsphere",
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    foods: {
      type: mongoose.Schema.ObjectId,
      ref: "Foods",
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create bootcamp slug from the name mongoose middleware
OrderSchema.pre("save", function (next) {
  // console.log('Slugify ran', this.name)
  this.slug = slugify(this.name, { lower: true });
  next();
});

//Geocode & create location field
OrderSchema.pre("save", async function (next) {
  const loc = await geocoder.geocode(this.address);
  this.location = {
    type: "Point",
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
  };

  // Do not save address in the DB
  this.address = undefined;
  next();
});

module.exports = mongoose.model("Orders", OrderSchema);
