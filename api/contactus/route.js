var express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const XLSX = require("xlsx");
const userSchema = require("../stock/model");
const moment = require("moment");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "your_secret_key";
const verifyToken = require("../../Middleware/verifytoken");
const Cart = require("../cart/model");
const Contact = require("./model");
const nodemailer = require("nodemailer");

const router = express.Router();

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "mailto:ip32portal@gmail.com",
    pass: "urfszbvriwpqjnux",
  },
});

const sendEmail = async (toEmail, subject, body) => {
  try {
    const mailOptions = {
      from: "mailto:jpsjewels@gmail.com",
      to: toEmail,
      subject: subject,
      html: body, // Sending HTML content
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error.message);
  }
};

const addContact = async (data) => {
  try {
    const timestamp = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
    data.createdAt = timestamp;
    data.updatedAt = timestamp;

    const newContact = await Contact.create(data);

    if (!data.Email) {
      return { statusCode: 400, message: "Recipient email is required." };
    }

    const emailBody = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Contact Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; }
            .email-container { max-width: 600px; margin: 20px auto; background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
            .email-header { background: rgb(172, 130, 80); color: #fff; padding: 20px; text-align: center; font-size: 24px; border-bottom: 3px solid #0056b3; }
            .email-body { padding: 20px; }
            .email-body h2 { color: rgb(172, 130, 80); }
            .email-body p { font-size: 16px; line-height: 1.6; }
            .email-footer { background: #f1f1f1; text-align: center; padding: 15px; font-size: 14px; color: #777; border-top: 1px solid #ddd; }
            .email-footer a { color: #007BFF; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">Contact Confirmation</div>
            <div class="email-body">
              <h2>Hello</h2>
              <p>Thank you for reaching out to us! We have received your contact details and will get back to you shortly.</p>
              <p><strong>Email:</strong> ${data.Email}</p>
              <p><strong>Phone:</strong></p>
              <p><strong>Message:</strong></p>
            </div>
            <div class="email-footer">
              <p>Need help? <a href="mailto:mitmangukiya192@gmail.com">Contact Support</a></p>
              <p>Thank you for choosing JPS Jewels!</p>
            </div>
          </div>
        </body>
        </html>
      `;

    await sendEmail(data.Email, "We Received Your Contact Request!", emailBody);

    return {
      statusCode: 200,
      data: newContact,
      message: "Contact details saved and email sent successfully.",
    };
  } catch (error) {
    console.error("Error in addContact:", error.message);
    return {
      statusCode: 500,
      message: "An error occurred while saving contact details.",
      error: error.message,
    };
  }
};

router.post("/addcontact", async (req, res) => {
  try {
    req.body.ContactId = Date.now();
    const response = await addContact(req.body);
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error("Error:", error.message);
    res
      .status(500)
      .json({ message: "Something went wrong, please try later!" });
  }
});

const contactDetails = async () => {
  const contact = await Contact.aggregate([
    {
      $project: {
        Email: 1,
        Name: 1,
        ContactId: 1,
        Message: 1,
        Subject: 1,
      },
    },
  ]);

  const stockCount = contact.length;

  return {
    statusCode: stockCount > 0 ? 200 : 204,
    message:
      stockCount > 0 ? "Quotes retrieved successfully" : "No Contact found",
    data: contact,
    TotalCount: stockCount,
  };
};

router.get("/contactdetails", async (req, res) => {
  try {
    const response = await contactDetails();
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error("Error:", error.message);
    res
      .status(500)
      .json({ message: "Something went wrong, please try later!" });
  }
});

const contactDetailsPopup = async (ContactId) => {
  if (!ContactId) {
    throw new Error("AddToCartId is required.");
  }

  const quoteSearchQuery = {
    ContactId,
    IsDelete: false,
  };

  const rawCartData = await Contact.find(quoteSearchQuery);

  if (rawCartData.length === 0) {
    return {
      statusCode: 204,
      message: "No quotes found",
      data: [],
    };
  }

  const contact = await Contact.aggregate([
    { $match: quoteSearchQuery },
    {
      $project: {
        Email: 1,
        Name: 1,
        ContactId: 1,
        Message: 1,
        Subject: 1,
      },
    },
  ]);

  const stockCount = contact.length;

  return {
    statusCode: stockCount > 0 ? 200 : 204,
    message:
      stockCount > 0 ? "Quotes retrieved successfully" : "No Contact found",
    data: contact,
    TotalCount: stockCount,
  };
};

router.get("/contactdetailspopup", async (req, res) => {
  try {
    const { ContactId } = req.query;

    const response = await contactDetailsPopup(ContactId);
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error("Error:", error.message);
    res
      .status(500)
      .json({ message: "Something went wrong, please try later!" });
  }
});

module.exports = router;
