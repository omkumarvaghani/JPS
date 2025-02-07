var express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const XLSX = require("xlsx");
const userSchema = require("../stock/model");
const moment = require("moment");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "your_secret_key";
const Cart = require("../cart/model");
const Billing = require("./model");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const { verifyLoginToken } = require("../authentication/authentication");

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "ip32portal@gmail.com",
    pass: "urfszbvriwpqjnux",
  },
});

const deltebillingdata = async (BillingId) => {
  try {
    const updatebilling = await Billing.findOneAndUpdate(
      { BillingId },
      { $set: { IsDelete: true } },
      { new: true }
    );

    if (!updatebilling) {
      return {
        statusCode: 404,
        message: `No user found`,
      };
    }
    return {
      statusCode: 200,
      message: `User deleted successfully.`,
      data: updatebilling,
    };
  } catch (error) {
    F;
    return {
      statusCode: 500,
      message: "Failed to soft delete user data.",
      error: error.message,
    };
  }
};

router.delete(
  "/deletebilingdata/:BillingId",
  verifyLoginToken,
  async (req, res) => {
    try {
      const { BillingId } = req.params;
      const response = await deltebillingdata(BillingId);
      res.status(response.statusCode).json(response);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({
        statusCode: 500,
        message: "Something went wrong, please try later!",
      });
    }
  }
);

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
        const diamond = await userSchema
          .findOne({ SKU: cartItem.SKU, IsDelte: false })
          .lean();
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
      BillingId: uuidv4(),
      UserId,
      SKU: item.SKU,
      Quantity: item.Quantity,
      Image: item.Image,
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
                        Billing ID: <strong>${item.BillingId}</strong><br>
                          <strong>${item.Carats} Carat ${
                          item.Shape
                        } Diamond</strong><br>
                          Color: ${item.Color}, Clarity: ${
                          item.Clarity
                        }, Lab: ${item.Lab}, Cut: ${item.Cut}<br>
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
      { UserId, IsCheckout: false, IsDelete: false },
      { $set: { IsCheckout: true, IsDelete: true } }
    );

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

router.post("/addbilling", verifyLoginToken, async (req, res) => {
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
  try {
    const billingDetails = await Billing.aggregate([
      {
        $match: { IsDelete: { $exists: true, $eq: false } }, // Ensure IsDelete exists and is false
      },
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
          Image: 1,
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
        $sort: { createdAt: -1 },
      },
    ]);

    const billingCount = billingDetails.length;

    return {
      statusCode: billingCount > 0 ? 200 : 204,
      message:
        billingCount > 0
          ? "Billing details retrieved successfully"
          : "No billing details found",
      data: billingDetails,
      totalCount: billingCount,
    };
  } catch (error) {
    console.error("Error fetching billing details:", error);
    throw new Error("Failed to fetch billing details.");
  }
};

router.get("/billingdata", verifyLoginToken, async function (req, res) {
  try {
    const result = await fetchBillingDetails();
    res.status(result.statusCode).json({
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
      totalCount: result.totalCount,
    });
  } catch (error) {
    console.error("Error in billing data route:", error.message);
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
      $lookup: {
        from: "stocks", // Ensure this is the correct collection name
        localField: "SKU", // Field in Billing collection
        foreignField: "SKU", // Field in Stocks collection
        as: "stockDetails", // Keep all matching stocks inside an array
      },
    },
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
        Image: 1,
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
        Video: 1,
        stockDetails: 1,
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

router.get("/billingpopup", verifyLoginToken, async function (req, res) {
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

module.exports = router;
