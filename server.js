const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const fileupload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const connetDB = require("./config/db");
const errorHandler = require("./middleware/error");

// Load env vars
dotenv.config({ path: "./config/config.env" });

// Connect to DB
connetDB();

//Router files
const foods = require("./routes/foods");
const orders = require("./routes/orders");
const auth = require("./routes/auth");
const users = require("./routes/users");

const app = express();

// body parser
app.use(express.json());

// cookies parser
app.use(cookieParser());

// Custom logger
// const logger = require('./middleware/logger');
// app.use(logger);

//Dev logging middleware
if (process.env.NODE_ENV == "development") {
  app.use(morgan("dev"));
}

// File upload
app.use(fileupload());

// Sanitize data prevent nosql injection
app.use(mongoSanitize());

// Set security headers prevent cross-site scripting attacks and other cross-site injection
app.use(helmet());

// Prevent XSS attacks (cross site scripting)
app.use(xss());

// Rate limiting when making request to api
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, //10 mins
  max: 100, //request limit
});

app.use(limiter);

// Prevent http params pollution. HPP puts array parameters in req.query and/or req.body aside and just selects the last parameter value.
app.use(hpp());

// Enable CORS - Cross-origin resource sharing
app.use(cors());

//Set static folder
app.use(express.static(path.join(__dirname, "public")));

//Mount router
app.use("/api/v1/foods", foods);
app.use("/api/v1/orders", orders);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandle promise rejections

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  //Close server and exit process
  server.close(() => process.exit(1));
});

async function check(req, res) {
  const a = await someOtherFunction().catch((err) => {
    console.log(err);
  });

  if (a) {
    return a;
  }
  const b = await somethingElseFunction().catch((err) => {
    console.log(err);
  });

  return b;

  res.send("result");
}
