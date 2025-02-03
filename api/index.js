  var express = require("express");
  const mongoose = require("mongoose");
  const multer = require("multer");
  const XLSX = require("xlsx");
  const userSchema = require("../api/stock/model");
  const Signup = require("../api/users/model");
  const moment = require("moment");
  const bcrypt = require("bcrypt");
  const jwt = require("jsonwebtoken");
  const SECRET_KEY = "your_secret_key";
  const verifyToken = require("../Middleware/verifytoken");
  const Cart = require("../api/cart/model");
  const Billing = require("../api/billing/model");
  const nodemailer = require("nodemailer");
  const addtocart = require("../api/cart/model");
  const signup = require("../api/users/model");

  const router = express.Router();

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname.replace(/\s/g, ""));
    },
  });

  const upload = multer({ storage: storage });

  router.post("/students", upload.single("file"), async (req, res) => {
    try {
      // data["createdAt"] = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
      // data["updatedAt"] = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

      const fileName = req.file.filename;
      const fileData = `./${fileName}`;
      const workbook = XLSX.readFile(fileData);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      for (const data of jsonData) {
        await userSchema.findOneAndUpdate(
          { SKU: data.SKU },
          {
            Image: data.Image,
            Video: data.Video,
            DiamondType: data["Diamond Type"],
            HA: data["H&A"],
            Ratio: data.Ratio,
            Tinge: data.Tinge,
            Milky: data.Milky,
            EyeC: data.EyeC,
            Table: data["Table(%)"],
            Depth: data["Depth(%)"],
            measurements: data.measurements,
            Amount: data["Amount U$"],
            Price: data["Price $/ct"],
            Disc: data["Disc %"],
            Rap: data["Rap $"],
            FluoInt: data["Fluo Int"],
            Symm: data.Symm,
            Polish: data.Polish,
            Cut: data.Cut,
            Clarity: data.Clarity,
            Color: data.Color,
            Carats: data.Carats,
            Shape: data.Shape,
            CertificateNo: data["Certificate No"],
            Lab: data.Lab,
            SKU: data.SKU,
            SrNo: data["Sr.No"],
          },
          { upsert: true, new: true }
        );
      }

      res
        .status(200)
        .json({ success: true, message: "Excel file processed successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "An error occurred while processing the request",
      });
    }
  });

  const labUrlMap = {
    HRD: "https://my.hrdantwerp.com/Download/GetGradingReportPdf/?reportNumber=",
    GIA: "https://www.gia.edu/report-check?locale=en_US&reportno=",
    IGI: "https://www.igi.org/API-IGI/viewpdf-url.php?r=",
  };

  function getCertificateUrl(lab, certificateNo) {
    if (!lab || !certificateNo) {
      return null;
    }

    const labKey = Object.keys(labUrlMap).find(
      (key) => key.toLowerCase() === lab.toLowerCase()
    );
    if (!labKey) {
      return null;
    }

    const urlBase = labUrlMap[labKey];

    if (labKey === "HRD") {
      return `${urlBase}${encodeURIComponent(
        certificateNo
      )}&printDocumentType=DiamondIdentificationReportPlusMini`;
    }

    return `${urlBase}${encodeURIComponent(certificateNo)}`;
  }

  const fetchQuoteDetails = async () => {
    const quotes = await userSchema.aggregate([
      {
        $project: {
          Image: 1,
          Video: 1,
          DiamondType: 1,
          HA: 1,
          Ratio: 1,
          Tinge: 1,
          Milky: 1,
          EyeC: 1,
          Table: 1,
          Depth: 1,
          measurements: 1,
          Amount: 1,
          Price: 1,
          Disc: 1,
          Rap: 1,
          FluoInt: 1,
          Symm: 1,
          Polish: 1,
          Cut: 1,
          Clarity: 1,
          Color: 1,
          Carats: 1,
          Shape: 1,
          CertificateNo: 1,
          Lab: 1,
          SKU: 1,
          SrNo: 1,
        },
      },
    ]);

    return {
      statusCode: quotes.length > 0 ? 200 : 204,
      message:
        quotes.length > 0 ? "Quotes retrieved successfully" : "No quotes found",
      data: quotes,
    };
  };

  router.get("/data", async function (req, res) {
    try {
      const result = await fetchQuoteDetails();

      if (result.statusCode === 200) {
        result.data.forEach((quote) => {
          const certificateUrl = getCertificateUrl(
            quote.Lab,
            quote.CertificateNo
          );
          quote.certificateUrl = certificateUrl;
        });
      }

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

  function getDefaultImageUrl(Shape) {
    const lowerCaseShape = Shape.toLowerCase();
    switch (lowerCaseShape) {
      case "asscher":
      case "sq eme":
        return "https://jpsjewels.com/wp-content/uploads/Emerald-Square.png";
      case "baguette":
      case "bug":
        return "https://jpsjewels.com/wp-content/uploads/Tapered-baguette.png";
      case "cushion":
      case "cu":
        return "https://jpsjewels.com/wp-content/uploads/Cushion.png";
      case "square cushion":
      case "sq cu":
        return "https://jpsjewels.com/wp-content/uploads/Cushion.png";
      case "cushion modified":
        return "https://jpsjewels.com/wp-content/uploads/Cushion-Square.png";
      case "emerald":
      case "eme":
        return "https://jpsjewels.com/wp-content/uploads/Emerald-Square.png";
      case "square emerald":
        return "https://jpsjewels.com/wp-content/uploads/Emerald-Square.png";
      case "heart":
      case "he":
        return "https://jpsjewels.com/wp-content/uploads/Heart.png";
      case "heart modified":
        return "https://jpsjewels.com/wp-content/uploads/Heart.png";
      case "long radiant":
      case "long rad":
        return "https://jpsjewels.com/wp-content/uploads/Radiant.png";
      case "marquise":
      case "mq":
        return "https://jpsjewels.com/wp-content/uploads/Marquise.png";
      case "marquise modified":
        return "https://jpsjewels.com/wp-content/uploads/Marquise.png";
      case "oval":
      case "ovl":
        return "https://jpsjewels.com/wp-content/uploads/Oval.png";
      case "pear":
      case "pe":
        return "https://jpsjewels.com/wp-content/uploads/Pear.png";
      case "princess":
      case "pri":
        return "https://jpsjewels.com/wp-content/uploads/Princess.png";
      case "princess modified":
        return "https://jpsjewels.com/wp-content/uploads/Princess.png";
      case "radiant":
      case "rad":
        return "https://jpsjewels.com/wp-content/uploads/Radiant-Square.png";
      case "radiant modified":
        return "https://jpsjewels.com/wp-content/uploads/Radiant.png";
      case "round":
      case "rbc":
        return "https://jpsjewels.com/wp-content/uploads/Round.png";
      default:
        return "https://jpsjewels.com/wp-content/uploads/Round.png";
    }
  }

  const fetchDaimondDetails = async (SkuId) => {
    const diamondSearchQuery = {
      SKU: SkuId,
    };

    const diamonds = await userSchema.aggregate([
      { $match: diamondSearchQuery },
      {
        $project: {
          Image: 1,
          Video: 1,
          DiamondType: 1,
          HA: 1,
          Ratio: 1,
          Tinge: 1,
          Milky: 1,
          EyeC: 1,
          Table: 1,
          Depth: 1,
          measurements: 1,
          Amount: 1,
          Price: 1,
          Disc: 1,
          Rap: 1,
          FluoInt: 1,
          Symm: 1,
          Polish: 1,
          Cut: 1,
          Clarity: 1,
          Color: 1,
          Carats: 1,
          Shape: 1,
          CertificateNo: 1,
          Lab: 1,
          SKU: 1,
          SrNo: 1,
        },
      },
    ]);

    return {
      statusCode: diamonds.length > 0 ? 200 : 204,
      message:
        diamonds.length > 0 ? "diamonds retrieved successfully" : "No diamonds found",
      data: diamonds,
    };
  };

  router.get("/data/:SkuId", async function (req, res) {
    try {
      const { SkuId } = req.params;
      const result = await fetchDaimondDetails(SkuId);

      if (result.statusCode === 200) {
        result.data.forEach((diamond) => {
          // Add certificate URL
          const certificateUrl = getCertificateUrl(
            diamond.Lab,
            diamond.CertificateNo
          );
          diamond.certificateUrl = certificateUrl;

          // Add default image URL based on the shape
          const defaultImageUrl = getDefaultImageUrl(diamond.Shape);
          diamond.Image =
            diamond.Image && diamond.Image.length > 0 ? diamond.Image : defaultImageUrl;
        });
      }

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

  router.get("/stockpopup", async function (req, res) {
    try {
      const { SkuId } = req.query;
      const result = await fetchDaimondDetails(SkuId);

      if (result.statusCode === 200) {
        result.data.forEach((diamond) => {
          // Add certificate URL
          const certificateUrl = getCertificateUrl(
            diamond.Lab,
            diamond.CertificateNo
          );
          diamond.certificateUrl = certificateUrl;

          // Add default image URL based on the shape
          const defaultImageUrl = getDefaultImageUrl(diamond.Shape);
          diamond.Image =
            diamond.Image && diamond.Image.length > 0 ? diamond.Image : defaultImageUrl;
        });
      }

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

  const fetchCartDetails = async (UserId, SKU) => {
    if (!UserId) {
      throw new Error("UserId is required to fetch cart details.");
    }

    const quoteSearchQuery = { UserId, IsDelete: false }; // Start with UserId
    if (SKU) quoteSearchQuery.SKU = SKU; // Add SKU if it's provided


    const quotes = await Cart.aggregate([
      { $match: quoteSearchQuery },
      {
        $lookup: {
          from: "users",
          localField: "SKU",
          foreignField: "SKU",
          as: "diamondDetails",
        },
      },
      {
        $unwind: { path: "$diamondDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          SKU: 1,
          UserId: 1,
          diamondDetails: 1,
          Quantity: 1,
        },
      },
    ]);

    return {
      statusCode: quotes.length > 0 ? 200 : 204,
      message:
        quotes.length > 0 ? "Quotes retrieved successfully" : "No quotes found",
      data: quotes,
    };
  };

  router.get("/cart", async function (req, res) {
    try {
      const { userId, SKU } = req.query;

      if (!userId) {
        return res.status(400).json({
          statusCode: 400,
          message: "UserId is required to fetch cart details.",
        });
      }

      const result = await fetchCartDetails(userId, SKU);

      res.status(result.statusCode).json({
        statusCode: result.statusCode,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error("Error fetching cart details:", error.message);
      res.status(500).json({
        statusCode: 500,
        message: "An error occurred while fetching cart details.",
        error: error.message,
      });
    }
  });

  const fetchCartWithoutCheckout = async () => {
    const quoteSearchQuery = { IsDelete: false, IsCheckout: false }; // Start with UserId// Add SKU if it's provided


    const quotes = await Cart.aggregate([
      { $match: quoteSearchQuery },
      {
        $lookup: {
          from: "users",
          localField: "SKU",
          foreignField: "SKU",
          as: "diamondDetails",
        },
      },
      {
        $lookup: {
          from: "signups",
          localField: "UserId",
          foreignField: "UserId",
          as: "userDetails",
        },
      },
      {
        $unwind: { path: "$diamondDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          SKU: 1,
          UserId: 1,
          diamondDetails: 1,
          userDetails: 1,
          Quantity: 1,
        },
      },
    ]);

    return {
      statusCode: quotes.length > 0 ? 200 : 204,
      message:
        quotes.length > 0 ? "Quotes retrieved successfully" : "No quotes found",
      data: quotes,
    };
  };

  router.get("/cartwithoutcheckout", async function (req, res) {
    try {

      const result = await fetchCartWithoutCheckout();

      res.status(result.statusCode).json({
        statusCode: result.statusCode,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error("Error fetching cart details:", error.message);
      res.status(500).json({
        statusCode: 500,
        message: "An error occurred while fetching cart details.",
        error: error.message,
      });
    }
  });

  const fetchCartWithoutCheckoutPopup = async (AddToCartId) => {
    const quoteSearchQuery = { AddToCartId, IsDelete: false, IsCheckout: false }; // Start with UserId// Add SKU if it's provided


    const quotes = await Cart.aggregate([
      { $match: quoteSearchQuery },
      {
        $lookup: {
          from: "users",
          localField: "SKU",
          foreignField: "SKU",
          as: "diamondDetails",
        },
      },
      {
        $lookup: {
          from: "signups",
          localField: "UserId",
          foreignField: "UserId",
          as: "userDetails",
        },
      },
      {
        $unwind: { path: "$diamondDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          SKU: 1,
          UserId: 1,
          diamondDetails: 1,
          userDetails: 1,
          Quantity: 1,
        },
      },
    ]);

    return {
      statusCode: quotes.length > 0 ? 200 : 204,
      message:
        quotes.length > 0 ? "Quotes retrieved successfully" : "No quotes found",
      data: quotes,
    };
  };

  router.get("/cartpopup", async function (req, res) {
    try {
      const { AddToCartId } = req.query;
      const result = await fetchCartWithoutCheckoutPopup(AddToCartId);

      res.status(result.statusCode).json({
        statusCode: result.statusCode,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error("Error fetching cart details:", error.message);
      res.status(500).json({
        statusCode: 500,
        message: "An error occurred while fetching cart details.",
        error: error.message,
      });
    }
  });

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
          $project: {
            UserId: 1,  
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

      return {
        statusCode: 200,
        message: "Users retrieved successfully.",
        data: Users,
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
      const user = await Signup.findOne({ Username });
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

  const addToCart = async (data, UserId) => {
    try {
      data["createdAt"] = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
      data["updatedAt"] = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");


      if (!data.AddToCartId) {
        data.AddToCartId = Date.now().toString(); // You can also prepend a prefix or make this more complex if needed
      }

      const existingItem = await Cart.findOne({
        UserId: UserId,
        SKU: data.SKU, // Match SKU along with UserId
        IsCheckout: false,
        IsDelete: false,
      });


      if (existingItem) {
        // Update the quantity if the item already exists
        const updatedItem = await Cart.findOneAndUpdate(
          { UserId: existingItem.UserId, SKU: data.SKU }, // Find the item by UserId and SKU
          { $inc: { Quantity: data.Quantity } }, // Increment the quantity
          { new: true } // Return the updated document
        );


        return {
          statusCode: 200,
          data: updatedItem,
          message: "Item quantity updated in the cart",
        };
      } else {
        // If the item does not exist, create a new cart entry
        const newCartItem = await Cart.create(data); // Use data instead of req.body

        return {
          statusCode: 200,
          data: newCartItem,
          message: "Item added to the cart",
        };
      }
    } catch (error) {
      console.error("Error:", error.message);
      return {
        statusCode: 500,
        message: "An error occurred while adding the item to the cart",
        error: error.message,
      };
    }
  };

  router.post("/addtocart", async (req, res) => {
    // const token = req.headers["authorization"]?.split(" ")[1];
    // if (!token) {
    //   return res.status(401).json({ message: "Unauthorized" });
    // }
    try {
      const UserId = req.body.UserId;
      // const decoded = jwt.verify(token, "your_secret_key");
      // req.body.UserId = decoded.Userid;
      const response = await addToCart(req.body, UserId);
      res.status(response.statusCode).json(response);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({
        statusCode: 500,
        message: "Something went wrong, please try later!",
      });
    }
  });

  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "ip32portal@gmail.com",
      pass: "urfszbvriwpqjnux",
    },
  });

  // Function to send email
  const sendEmail = async (toEmail, subject, body) => {
    try {
      const mailOptions = {
        from: "jpsjewels@gmail.com", // Sender's email
        to: toEmail, // Recipient's email
        subject: subject,
        text: body, // Plain text body
        html: `<p>${body}</p>`, // HTML body
      };

      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error sending email:", error.message);
    }
  };

  // Updated addBilling function
  const addBilling = async (data, UserId) => {
    try {
      const timestamp = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
      data.createdAt = timestamp;
      data.updatedAt = timestamp;

      // Fetch cart details
      const cartDetails = await Cart.find({
        UserId,
        IsCheckout: false,
        IsDelete: false, // Check IsDelete is false and IsCheckout is false
      }).lean();
      if (!cartDetails || cartDetails.length === 0) {
        return {
          statusCode: 404,
          message: "No cart details found for the user.",
        };
      }

      // Fetch diamond details
      const diamDetails = await Promise.all(
        cartDetails.map(async (cartItem) => {
          const diamond = await userSchema.findOne({ SKU: cartItem.SKU }).lean();
          return {
            ...cartItem,
            ...diamond,
            Amount: cartItem.Quantity * diamond.Price,
          };
        })
      );

      // Add billing details for each item
      const billingEntries = diamDetails.map((item) => ({
        ...data,
        BillingId: `${Date.now()}`,
        UserId,
        SKU: item.SKU,
        Quantity: item.Quantity,
        Price: item.Price,
        Carats: item.Carats,
        Shape: item.Shape,
        Color: item.Color,
        Clarity: item.Clarity,
        Lab: item.Lab,
        Cut: item.Cut,
        Amount: item.Amount,
        createdAt: timestamp,
        updatedAt: timestamp,
      }));

      // Save all billing entries
      const newBillings = await Billing.insertMany(billingEntries);

      // Send email with order details
      const productsList = billingEntries
        .map(
          (item) => `
            <li>
              ${item.Carats} Carat ${item.Shape} ${item.Color}/${item.Clarity}
              Diamond (${item.Lab}, ${item.Cut}) - 
              Quantity: ${item.Quantity} x ${item.Price} = $${item.Amount}
            </li>
          `
        )
        .join("");

        await sendEmail(
          data.ContactEmail,
          "Your Billing Details Have Been Successfully Added!",
          `
              <!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Billing Details</title>
                <style>
                  body {
                    font-family: 'Arial', sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                    color: #333333;
                  }
                  .email-container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    border-radius: 10px;
                    border: 2px solid rgb(23, 22, 22);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                  }
                  .email-header {
                    background-color:rgb(172, 130, 80);
                    color: #ffffff;
                    padding: 20px;
                    text-align: center;
                    border-bottom: 3px solid #0056b3;
                  }
                  .email-header h1 {
                    margin: 0;
                    font-size: 24px;
                  }
                  .email-body {
                    padding: 20px;
                  }
                  .email-body h2 {
                    font-size: 20px;
                    color:rgb(172, 130, 80);
                  }
                  .email-body p {
                    line-height: 1.6;
                    font-size: 16px;
                  }
                  .email-body ul {
                    list-style: none;
                    padding: 0;
                  }
                  .email-body ul li {
                    background-color: #f9f9f9;
                    margin: 10px 0;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    color: #333;
                  }
                  .total-amount {
                    text-align: center;
                    margin: 20px 0;
                    font-size: 18px;
                    font-weight: bold;
                    color: #333;
                  }
                  .cta {
                    text-align: center;
                    margin: 30px 0;
                  }
                  .cta a {
                    background-color: #007BFF;
                    color: #ffffff;
                    text-decoration: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    font-size: 16px;
                    transition: background-color 0.3s ease;
                  }
                  .cta a:hover {
                    background-color: #0056b3;
                  }
                  .email-footer {
                    background-color: #f1f1f1;
                    text-align: center;
                    padding: 15px;
                    font-size: 14px;
                    color: #777777;
                    border-top: 1px solid #ddd;
                  }
                  .email-footer a {
                    color: #007BFF;
                    text-decoration: none;
                  }
                </style>
              </head>
              <body>
                <div class="email-container">
                  <!-- Header -->
                  <div class="email-header">
                    <h1>Your Billing Details</h1>
                  </div>
                  
                  <!-- Body -->
                  <div class="email-body">
                    <h2>Hello ${data.FirstName || "Customer"} ${
            data.LastName || ""
          },</h2>
    
                    <p>Thank you for choosing our services. Here are the details of your recent billing:</p>
          
                    <ul>
                      ${billingEntries
                        .map(
                          (item) => `
                          <li>
                            <strong>${item.Carats} Carat ${
                            item.Shape
                          } Diamond</strong><br>
                            Color: ${item.Color}, Clarity: ${item.Clarity}, Lab: ${
                            item.Lab
                          }, Cut: ${item.Cut}<br>
                            Quantity: ${item.Quantity} x $${item.Price.toFixed(
                            2
                          )}<br>
                            <strong>Total: $${item.Amount.toFixed(2)}</strong>
                          </li>
                        `
                        )
                        .join("")}
                    </ul>
          
                    <div class="total-amount">
                      Total Amount: <span>$${billingEntries
                        .reduce((acc, item) => acc + item.Amount, 0)
                        .toFixed(2)}</span>
                    </div>
          
                  </div>
          
                  <!-- Footer -->
                  <div class="email-footer">
                    <p>Need help? <a href="mailto:mitmangukiya192@gmail.com">Contact Support</a></p>
                    <p>Thank you for choosing our services!<br><strong>JPS Jwelers</strong></p>
                  </div>
                </div>
              </body>
              </html>
            `
        );

        const updateCheckoutStatus = await Cart.updateMany(
          { UserId, IsCheckout: false, IsDelete: false }, // Conditions
          { $set: { IsCheckout: true, IsDelete: true } }   // Update fields
        );
    

        // const updateCheckoutStatus = await Cart.findByIdAndUpdate(
        //   { UserId, IsCheckout: false, IsDelete: false },
        //   { $set: { IsCheckout: true, IsDelete: true } } ,
        //   { new : true } // Assuming you want to mark as checked out
        // );
    

      return {
        statusCode: 200,
        data: newBillings,
        message: "Billing details added successfully.",
      };
    } catch (error) {
      console.error("Error in addBilling:", error.message);
      return {
        statusCode: 500,
        message: "An error occurred while adding billing details.",
        error: error.message,
      };
    }
  };

  router.post("/addbilling", async (req, res) => {
    try {

      // Generate a unique Billing ID
      req.body.BillingId = Date.now();

      const { UserId } = req.query;

      // Call the addBilling function
      const response = await addBilling(req.body, UserId);

      // Send the response back to the client
      res.status(response.statusCode).json(response);
    } catch (error) {
      console.error("Error:", error.message);
      res.status(500).json({
        statusCode: 500,
        message: "Something went wrong, please try later!",
      });
    }
  });

  const fetchBillingDetails = async () => {
    const billingdetail = await Billing.aggregate([
      {
        $project: {
          BillingId: 1,
          UserId: 1,
          ContactEmail: 1,
          Country: 1,
          FirstName: 1,
          LastName: 1,
          Appartment: 1,
          City: 1,
          State: 1,
          PinCode: 1,
          Phone: 1,
          Quantity: 1,
          Price: 1,
          Carats: 1,
          Shape: 1,
          Color: 1,
          Clarity: 1,
          Lab: 1,
          Cut: 1,
          SKU: 1,
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

  router.get("/billingdata", async function (req, res) {
    try {
      const result = await fetchBillingDetails();

      res.status(result.statusCode).json({
        statusCode: result.statusCode,
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

  const fetchBillingPopup = async (BillingId) => {
    const matchBillingId = {
      BillingId: BillingId,
    };

    const billingdetail = await Billing.aggregate([
      { $match: matchBillingId },
      {
        $project: {
          BillingId: 1,
          UserId: 1,
          ContactEmail: 1,
          Country: 1,
          FirstName: 1,
          LastName: 1,
          Appartment: 1,
          City: 1,
          State: 1,
          PinCode: 1,
          Phone: 1,
          Quantity: 1,
          Price: 1,
          Carats: 1,
          Shape: 1,
          Color: 1,
          Clarity: 1,
          Lab: 1,
          Cut: 1,
          SKU: 1,
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

  router.get("/billingpopup", async function (req, res) {
    try {
      const { BillingId } = req.query;
      const result = await fetchBillingPopup(BillingId);

      res.status(result.statusCode).json({
        statusCode: result.statusCode,
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

  const countDetails = async () => {
    try {
      const signupCount = await Signup.countDocuments({IsDelete: false});

      const billingCount = await Billing.countDocuments({IsDelete: false});

      const usersCount = await userSchema.countDocuments();

      const addtoCarts = await addtocart.countDocuments({IsDelete: false});

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

  const orderDetails = async () => {
    const orders = await Cart.aggregate([
      {
        $lookup: {
          from: "signups",
          localField: "UserId",
          foreignField: "UserId",
          as: "userDetails",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "SKU",
          foreignField: "SKU",
          as: "diamondDetails",
        },
      },
      {
        $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$diamondDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          SKU: 1,
          UserId: 1,
          userDetails: "$userDetails",
          diamondDetails: "$diamondDetails",
          Quantity: 1,
        },
      },
    ]);

    return {
      statusCode: orders.length > 0 ? 200 : 204,
      message:
        orders.length > 0 ? "orders retrieved successfully" : "No orders found",
      data: orders,
    };
  };

  router.get("/orderdetail", async function (req, res) {
    try {
      const result = await orderDetails();

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

  module.exports = router;
