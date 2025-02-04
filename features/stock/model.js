const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    Image: { type: String },
    Video: { type: String },
    DiamondType: { type: String },
    HA: { type: String },
    Ratio: { type: String },
    Tinge: { type: String },
    Milky: { type: String },
    EyeC: { type: String },
    Table: { type: Number },
    Depth: { type: Number },
    measurements: { type: String },
    Amount: { type: Number },
    Price: { type: Number },
    Disc: { type: Number },
    Rap: { type: Number },
    FluoInt: { type: String },
    Symm: { type: String },
    Polish: { type: String },
    Cut: { type: String },
    Clarity: { type: String },
    Color: { type: String },
    Carats: { type: Number },
    Shape: { type: String },
    CertificateNo: { type: String },
    Lab: { type: String },
    SKU: { type: String },
    SrNo: { type: String },
    IsDelete: { type: Boolean, default: false }, 
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("stocks", userSchema);
