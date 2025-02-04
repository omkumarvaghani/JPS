const mongoose = require("mongoose");

const signupSchema = new mongoose.Schema(
  {
    UserId: { type: String },
    Image: { type: String },
    Salutation: { type: String },
    FirstName: { type: String },
    LastName: { type: String },
    CompanyName: { type: String },
    Designation: { type: String },
    RegisterType: { type: String },
    City: { type: String }, 
    State: { type: String },
    Country: { type: String },
    Pincode: { type: String },
    CityPhoneCode: { type: Number },
    PhoneNo: { type: String },
    PrimaryEmail: { type: String },
    SecondaryEmail: { type: String },
    Website: { type: String },
    Username: { type: String },
    UserPassword: { type: String },
    ConfirmPassword: { type: String },
    LineofBusiness: { type: String },
    PreferredContactMethod: { type: String },
    PreferredContactDetails: { type: String },
    IsDelete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Signup", signupSchema);
