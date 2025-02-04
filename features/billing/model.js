const mongoose = require("mongoose");

const signupSchema = new mongoose.Schema(
  {
    BillingId: { type: String },
    UserId: { type: String },
    ContactEmail: { type: String },
    Country: { type: String },
    FirstName: { type: String },
    LastName: { type: String },
    Appartment: { type: String },
    City: { type: String },
    State: { type: String },
    PinCode: { type: String },
    Phone: { type: String },
    Quantity: { type: String },
    Image: { type: String },
    Price: { type: String },
    Carats: { type: String },
    Shape: { type: String },
    Color: { type: String },
    Clarity: { type: String },
    Lab: { type: String },
    Cut: { type: String },
    SKU: { type: String },
    Video: { type: String },
    IsDelete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Billing", signupSchema);
