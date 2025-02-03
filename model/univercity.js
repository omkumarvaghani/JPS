const mongoose = require("mongoose");

const uniSchema = new mongoose.Schema({
  name: { type: String, require: true },
  address: { type: String, require: true },
  contact_number: { type: Number },
});

module.exports = mongoose.model("Univercity", uniSchema);
