// var createError = require("http-errors");
// var express = require("express");
// var path = require("path");
// var cookieParser = require("cookie-parser");
// var logger = require("morgan");
// var DbCollection = require("./database/db");
// const cors = require("cors");

// var indexRouter = require("./routes/index");
// var routes = require("./api/index");

// var app = express();

// // view engine setup
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "jade");

// app.use(logger("dev"));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, "public")));

// app.use("/", indexRouter);
// app.use("/api", routes);

// // catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function (err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get("env") === "development" ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render("error");
// });

// app.use(cors({
//   origin: "http://localhost:4002", // Replace with your frontend URL
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"], // Add headers you expect from frontend
// }));

// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "http://localhost:4002");
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

//   // Respond to preflight requests
//   if (req.method === "OPTIONS") {
//     return res.sendStatus(204); // No content
//   }

//   next();
// });

// module.exports = app;

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var DbCollection = require("./database/db");
const cors = require("cors");

var indexRouter = require("./routes/index");
var routes = require("./api/index");
var superadminroutes = require("./api/Superadmin/route");
var billingroutes = require("./api/billing/route");
var cartroutes = require("./api/cart/route");
var stockroutes = require("./api/stock/route");
var userroutes = require("./api/users/route");
var contactusroutes = require("./api/contactus/route")

var app = express();

// CORS setup: allow requests from your frontend
// app.use(
//   cors({
//     origin: "http://127.0.0.1:5500", // Replace with your frontend URL
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"], // Add headers you expect from frontend
//   })
// );

app.use(cors());


// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/api", routes);
app.use("/api/superadmin", superadminroutes);
app.use("/api/billing", billingroutes);
app.use("/api/cart", cartroutes);
app.use("/api/stock", stockroutes);
app.use("/api/user", userroutes);
app.use("/api/contact", contactusroutes);

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

module.exports = app;
