  const mongoose = require("mongoose");

  const SuperadminSchema = new mongoose.Schema(
    {
      SuperadminId: {
        type: Number,
        unique: true,
      },
      EmailAddress: {
        type: String,
        unique: true,
      },
      Password: {
        type: String,
      },
      FirstName: {
        type: String,
      },
      LastName: {
        type: String,
      },
      IsDelete: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
  );

  module.exports = mongoose.model("Superadmin", SuperadminSchema);
