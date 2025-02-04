require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
const fs = require("fs");
const path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var nocache = require("nocache");

var initMongo = require("./config.js/mongo");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();


// New
// Signup Step
var superadminroutes = require("./features/Superadmin/route");
var billingroutes = require("./features/billing/route");
var cartroutes = require("./features/cart/route");
var stockroutes = require("./features/stock/route");
var userroutes = require("./features/users/route");
var contactroutes = require("./features/contactus/route");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(nocache());



app.use("/api", indexRouter);
app.use("/users", usersRouter);

// Signup Step
app.use("/api/superadmin", superadminroutes);
app.use("/api/billing", billingroutes);
app.use("/api/cart", cartroutes);
app.use("/api/stock", stockroutes);
app.use("/api/user", userroutes);
app.use("/api/contact", contactroutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// Init MongoDB
initMongo();

module.exports = app;
