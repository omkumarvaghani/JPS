const mongoose = require("mongoose");

const signupSchema = new mongoose.Schema(
  {
    AddToCartId: { type: String },
    UserId: { type: String },
    SKU: { type: String },
    Quantity: { type: Number },
    IsDelete: { type: Boolean, default: false },
    IsCheckout: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Addtocart", signupSchema);
