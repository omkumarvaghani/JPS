var express = require("express");
const userSchema = require("../stock/model");
const Signup = require("./model");
const moment = require("moment");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "your_secret_key";
const Billing = require("../billing/model");
const addtocart = require("../cart/model");
const signup = require("./model");

const router = express.Router();

const createUser = async (data, req) => {
  const UserId = Date.now();
  const uniqueId = UserId;

  data.UserId = uniqueId;
  data["createdAt"] = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
  data["updatedAt"] = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

  try {
    if (data.UserPassword !== data.ConfirmPassword) {
      return {
        statusCode: 400,
        message: "Password and Confirm Password do not match.",
      };
    }

    const companyNameExists = await Signup.findOne({
      CompanyName: data.CompanyName,
    });
    if (companyNameExists) {
      return {
        statusCode: 400,
        message: "CompanyName already exists.",
      };
    }

    const phoneNoExists = await Signup.findOne({ PhoneNo: data.PhoneNo });
    if (phoneNoExists) {
      return {
        statusCode: 400,
        message: "PhoneNo already exists.",
      };
    }

    const primaryEmailExists = await Signup.findOne({
      PrimaryEmail: data.PrimaryEmail,
    });
    if (primaryEmailExists) {
      return {
        statusCode: 400,
        message: "PrimaryEmail already exists.",
      };
    }

    const secondaryEmailExists = await Signup.findOne({
      SecondaryEmail: data.SecondaryEmail,
    });
    if (secondaryEmailExists) {
      return {
        statusCode: 400,
        message: "SecondaryEmail already exists.",
      };
    }

    const preferredContactExists = await Signup.findOne({
      PreferredContactDetails: data.PreferredContactDetails,
    });
    if (preferredContactExists) {
      return {
        statusCode: 400,
        message: "PreferredContactDetails already exists.",
      };
    }

    const userNameExists = await Signup.findOne({
      Username: data.Username,
    });
    if (userNameExists) {
      return {
        statusCode: 400,
        message: "Username already exists.",
      };
    }

    const UserPasswordExists = await Signup.findOne({
      UserPassword: data.UserPassword,
    });
    if (UserPasswordExists) {
      return {
        statusCode: 400,
        message: "UserPassword already exists.",
      };
    }

    // Hash the password using bcrypt
    const saltRounds = 10; // Number of salt rounds for bcrypt
    data.UserPassword = await bcrypt.hash(data.UserPassword, saltRounds);

    // Optionally, remove ConfirmPassword as it's not needed in the database
    delete data.ConfirmPassword;

    // Save user to database
    const userToSave = await Signup.create(data);

    return {
      statusCode: 200,
      message: "User Created Successfully",
      data: userToSave,
    };
  } catch (error) {
    return {
      statusCode: 400,
      message: "Failed to create User.",
      error: error.message,
    };
  }
};

router.post("/signup", async (req, res) => {
  try {
    const response = await createUser(req.body, req);
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

const getUser = async (UserId, req) => {
  try {
    const UsernameExists = {
      UserId: UserId,
      IsDelete: false,
    };

    if (!UsernameExists) {
      return {
        statusCode: 400,
        message: "User not exists.",
      };
    }

    const Userdata = await Signup.aggregate([
      { $match: UsernameExists },
      {
        $project: {
          Username: 1,
          PrimaryEmail: 1,
          FirstName: 1,
          LastName: 1,
        },
      },
    ]);

    return {
      statusCode: 200,
      message: "User geted Successfully",
      data: Userdata,
    };
  } catch (error) {
    return {
      statusCode: 400,
      message: "Failed to get User.",
      error: error.message,
    };
  }
};

router.get("/userdata", async (req, res) => {
  try {
    const { UserId } = req.query;
    const response = await getUser(UserId);
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

const getAllUsers = async () => {
  try {
    const Users = await Signup.aggregate([
      {
        $match: {
          IsDelete: false,
        },
      },
      {
        $project: {
          UserId: 1,
          Image: 1,
          Salutation: 1,
          FirstName: 1,
          LastName: 1,
          CompanyName: 1,
          Designation: 1,
          RegisterType: 1,
          City: 1,
          State: 1,
          Country: 1,
          Pincode: 1,
          CityPhoneCode: 1,
          PhoneNo: 1,
          PrimaryEmail: 1,
          SecondaryEmail: 1,
          Website: 1,
          Username: 1,
          UserPassword: 1,
          ConfirmPassword: 1,
          LineofBusiness: 1,
          PreferredContactMethod: 1,
          PreferredContactDetails: 1,
          IsDelete: 1,
        },
      },
    ]);

    if (Users.length === 0) {
      return {
        statusCode: 404,
        message: "No users found.",
      };
    }

    const usersCount = Users.length;
    return {
      statusCode: 200,
      message: "Users retrieved successfully.",
      data: Users,
      TotalCount: usersCount, // Returning the length of filtered users
    };
  } catch (error) {
    return {
      statusCode: 400,
      message: "Failed to retrieve users.",
      error: error.message,
    };
  }
};

router.get("/all-users", async (req, res) => {
  try {
    const response = await getAllUsers();
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

const fetchUserPopup = async (UserId) => {
  const matchBillingId = {
    UserId: UserId,
  };

  const billingdetail = await signup.aggregate([
    { $match: matchBillingId },
    {
      $project: {
        UserId: 1,
        Image: 1,
        Salutation: 1,
        FirstName: 1,
        LastName: 1,
        CompanyName: 1,
        Designation: 1,
        RegisterType: 1,
        City: 1,
        State: 1,
        Country: 1,
        Pincode: 1,
        CityPhoneCode: 1,
        PhoneNo: 1,
        PrimaryEmail: 1,
        SecondaryEmail: 1,
        Website: 1,
        Username: 1,
        UserPassword: 1,
        ConfirmPassword: 1,
        LineofBusiness: 1,
        PreferredContactMethod: 1,
        PreferredContactDetails: 1,
        IsDelete: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
    {
      $sort: { createdAt: -1 }, // Sort by `createdAt` in descending order
    },
  ]);

  return {
    statusCode: billingdetail.length > 0 ? 200 : 204,
    message:
      billingdetail.length > 0
        ? "Billing details retrieved successfully"
        : "No billing details found",
    data: billingdetail,
  };
};

router.get("/userpopup", async function (req, res) {
  try {
    const { UserId } = req.query;
    const result = await fetchUserPopup(UserId);

    // res.setHeader(
    //   "Cache-Control",
    //   "no-store, no-cache, must-revalidate, proxy-revalidate"
    // );
    // res.setHeader("Pragma", "no-cache");
    // res.setHeader("Expires", "0");
    // res.setHeader("Surrogate-Control", "no-store");

    res.status(result.statusCode).json({
      statusCode: 200,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try again later.",
    });
  }
});

const loginUser = async (data) => {
  const { Username, UserPassword } = data;

  try {
    // Check if the user exists
    const user = await Signup.findOne({ Username, IsDelete: false });
    if (!user) {
      return {
        statusCode: 404,
        message: "User not found",
      };
    }

    // Validate the password
    const isPasswordValid = await bcrypt.compare(
      UserPassword,
      user.UserPassword
    );
    if (!isPasswordValid) {
      return {
        statusCode: 401,
        message: "Invalid credentials",
      };
    }

    // Generate a JWT token
    const token = jwt.sign(
      { UserId: user.UserId, Username: user.Username },
      SECRET_KEY,
      { expiresIn: "5h" }
    );

    return {
      statusCode: 200,
      message: "Login successful",
      token,
      user: {
        UserId: user.UserId,
        Username: user.Username,
        FirstName: user.FirstName,
        LastName: user.LastName,
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: "An error occurred during login",
      error: error.message,
    };
  }
};

router.post("/login", async (req, res) => {
  try {
    const response = await loginUser(req.body);
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

const countDetails = async () => {
  try {
    const signupCount = await Signup.countDocuments({ IsDelete: false });

    const billingCount = await Billing.countDocuments({ IsDelete: false });

    const usersCount = await userSchema.countDocuments({ IsDelete: false,});

    const addtoCarts = await addtocart.countDocuments({
      IsDelete: false,
      IsCheckout: false,
    });

    return {
      statusCode: 200,
      message: "Counts retrieved successfully",
      data: {
        signupCount,
        billingCount,
        usersCount,
        addtoCarts,
      },
    };
  } catch (error) {
    console.error("Error fetching counts:", error.message);
    return {
      statusCode: 500,
      message: "An error occurred while fetching counts",
      error: error.message,
    };
  }
};

router.get("/countdata", async function (req, res) {
  try {
    const result = await countDetails();
    res.status(result.statusCode).json({
      statusCode: 200,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try again later.",
    });
  }
});

const deleteuserdata = async (UserId) => {
  try {
    const updateuser = await signup.findOneAndUpdate(
      { UserId },
      { $set: { IsDelete: true } },
      { new: true }
    );

    if (!updateuser) {
      return {
        statusCode: 404,
        message: `No user found`,
      };
    }
    return {
      statusCode: 200,
      message: `User deleted successfully.`,
      data: updateuser,
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: "Failed to soft delete user data.",
      error: error.message,
    };
  }
};

router.delete("/updateuser/:UserId", async (req, res) => {
  try {
    const { UserId } = req.params;
    const response = await deleteuserdata(UserId);
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

module.exports = router;
