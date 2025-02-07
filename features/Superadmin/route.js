var express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Superadmin = require("./model");
const moment = require("moment");
const SECRET_KEY = process.env.SECRET_KEY;
const { verifyLoginToken } = require("../authentication/authentication");
// Function to register a super admin
const registerSuperadmin = async (data) => {
  try {
    const SuperadminId = Date.now();
    const uniqueId = SuperadminId;

    data.SuperadminId = uniqueId;
    data["createdAt"] = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
    data["updatedAt"] = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

    const { EmailAddress, Password } = data;

    // Validate input
    if (!EmailAddress || !Password) {
      return {
        statusCode: 400,
        message: "EmailAddress and Password are required",
      };
    }

    // Check if the EmailAddress already exists
    const existingUser = await Superadmin.findOne({ EmailAddress });
    if (existingUser) {
      return {
        statusCode: 409,
        message: "EmailAddress already exists",
      };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(Password, 10); // 10 is the salt rounds

    // Create a new superadmin
    const newSuperadmin = new Superadmin({
      EmailAddress,
      Password: hashedPassword,
      SuperadminId: SuperadminId,
      FirstName: data.FirstName,
      LastName: data.LastName,
    });

    // Save to database
    await newSuperadmin.save();

    return {
      statusCode: 201,
      message: "Superadmin created successfully",
      superadmin: {
        EmailAddress: newSuperadmin.EmailAddress,
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: "An error occurred while creating the superadmin",
      error: error.message,
    };
  }
};

// Route to handle superadmin registration
router.post("/register-superadmin", async (req, res) => {
  try {
    const response = await registerSuperadmin(req.body);
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({
      statusCode: 500,
      message: "An internal server error occurred",
    });
  }
});

const superadminLogin = async (data) => {
  try {
    const { EmailAddress, Password } = data;

    // Validate inputs
    if (!EmailAddress || !Password) {
      return {
        statusCode: 400,
        message: "EmailAddress and Password are required",
      };
    }

    // Find the superadmin by EmailAddress
    const user = await Superadmin.findOne({ EmailAddress });
    if (!user) {
      return {
        statusCode: 401,
        message: "Invalid credentials",
      };
    }

    console.log(user, Password);
    // Check if the password is valid
    const isPasswordValid = bcrypt.compare(Password, user.Password);
    if (!isPasswordValid) {
      return {
        statusCode: 401,
        message: "Invalid credentials",
      };
    }

    // Generate a JWT token
    const token = jwt.sign(
      { SuperadminId: user.SuperadminId }, // Payload with SuperadminId
      SECRET_KEY, // Secret key
      { expiresIn: "1h" } // Token expiration (1 hour)
    );

    // Return a successful response with the token and user details
    return {
      statusCode: 200,
      message: "Login successful",
      token: token,
      superadminId: user.SuperadminId,
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: "An error occurred during login",
      error: error.message,
    };
  }
};

router.post("/superadminlogin", async (req, res) => {
  try {
    const response = await superadminLogin(req.body);
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({
      statusCode: 500,
      message: "An internal server error occurred",
    });
  }
});

const superadminDetails = async () => {
  const superadminProfile = await Superadmin.aggregate([
    {
      $project: {
        SuperadminId: 1,
        FirstName: 1,
        LastName: 1,
        EmailAddress: 1,
      },
    },
  ]);

  return {
    statusCode: superadminProfile.length > 0 ? 200 : 204,
    message:
      superadminProfile.length > 0
        ? "superadminProfile retrieved successfully"
        : "No superadminProfile found",
    data: superadminProfile,
  };
};

router.get("/superadmindetails", async function (req, res) {
  try {
    const result = await superadminDetails();

    res.status(result.statusCode).json({
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

const getTokenData = async (token) => {
  if (!token) {
    return {
      statusCode: 404,
      message: "Token is required",
    };
  }

  try {
    const data = jwt.verify(token, SECRET_KEY);
    return {
      statusCode: 200,
      data,
    };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return {
        statusCode: 401,
        message: "Token has expired. Please log in again.",
      };
    } else {
      return {
        statusCode: 401,
        message: "Invalid token. Please log in again.",
      };
    }
  }
};

router.post("/token_data", async (req, res) => {
  try {
    const { token } = req.body;
    const response = await getTokenData(token);

    if (response.statusCode !== 200) {
      return res.status(response.statusCode).json(response);
    }

    // Check if the superadmin exists and is active
    const superadmin = await Superadmin.findOne({
      SuperadminId: response?.data?.SuperadminId,
    });

    if (!superadmin) {
      return res.status(404).json({
        statusCode: 404,
        message: "Superadmin not found. Please log in again.",
      });
    }

    res.status(200).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

module.exports = router;
