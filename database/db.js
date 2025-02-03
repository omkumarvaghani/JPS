var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose
  .connect("mongodb+srv://mit22123:mit227123@hello.hv6m1sf.mongodb.net/Test")
  .then(() => console.log("connection successful"))
  .catch((err) => console.error("MongoDB Error", err));
module.exports = mongoose.connection;