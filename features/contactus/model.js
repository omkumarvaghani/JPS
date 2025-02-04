const mongoose = require("mongoose");

const signupSchema = new mongoose.Schema(
  {
    ContactId: { type: String },
    Name: { type: String },
    Email: { type: String },
    Subject: { type: String },
    Message: { type: String },
    IsDelete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("contact", signupSchema);
