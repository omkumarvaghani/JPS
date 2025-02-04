var express = require("express");
const mongoose = require("mongoose");
const moment = require("moment");
const Cart = require("./model");

const router = express.Router();


const fetchCartDetails = async (UserId, SKU) => {
  if (!UserId) {
    throw new Error("UserId is required to fetch cart details.");
  }

  const quoteSearchQuery = { UserId, IsDelete: false, IsCheckout: false }; // Start with UserId
  if (SKU) quoteSearchQuery.SKU = SKU; // Add SKU if it's provided

  // console.log("Search Query:", quoteSearchQuery);

  const quotes = await Cart.aggregate([
    { $match: quoteSearchQuery },
    {
      $lookup: {
        from:"stocks",
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

  const cartCount = quotes.length; 
  console.log("quotes", cartCount);


  return {
    statusCode: quotes.length > 0 ? 200 : 204,
    message:
      quotes.length > 0 ? "Quotes retrieved successfully" : "No quotes found",
    data: quotes,
    TotalCount: cartCount,
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
      TotalCount: result.TotalCount,
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

  // console.log("Search Query:", quoteSearchQuery);

  const quotes = await Cart.aggregate([
    { $match: quoteSearchQuery },
    {
      $lookup: {
        from:"stocks",
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
        AddToCartId: 1,
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
  try {
    if (!AddToCartId) {
      throw new Error("AddToCartId is required.");
    }

    const quoteSearchQuery = { AddToCartId, IsDelete: false, IsCheckout: false };
    // console.log("Search Query:", JSON.stringify(quoteSearchQuery, null, 2));

    // Fetch raw cart data before aggregation for debugging
    const rawCartData = await Cart.find(quoteSearchQuery);
    // console.log("Raw Cart Data:", rawCartData);

    if (rawCartData.length === 0) {
      return {
        statusCode: 204,
        message: "No quotes found",
        data: [],
      };
    }

    // Aggregation pipeline
    const quotes = await Cart.aggregate([
      { $match: quoteSearchQuery },
      {
        $lookup: {
          from:"stocks",
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
          _id: 1,
          SKU: 1,
          UserId: 1,
          AddToCartId: 1, // Explicitly included to ensure it's in the output
          Quantity: 1,
          diamondDetails: 1,
          userDetails: 1,
        },
      },
    ]);

    // console.log("Final Quotes Data:", quotes);

    return {
      statusCode: quotes.length > 0 ? 200 : 204,
      message: quotes.length > 0 ? "Quotes retrieved successfully" : "No quotes found",
      data: quotes,
    };
  } catch (error) {
    console.error("Error in fetchCartWithoutCheckoutPopup:", error.message);
    return {
      statusCode: 500,
      message: "An error occurred while fetching cart details.",
      error: error.message,
    };
  }
};

// API Route
router.get("/cartpopup", async function (req, res) {
  try {
    const { AddToCartId } = req.query;

    if (!AddToCartId) {
      return res.status(400).json({
        statusCode: 400,
        message: "AddToCartId is required",
      });
    }

    const result = await fetchCartWithoutCheckoutPopup(AddToCartId);

    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error fetching cart details:", error.message);
    res.status(500).json({
      statusCode: 500,
      message: "An error occurred while fetching cart details.",
      error: error.message,
    });
  }
});

const addToCart = async (data, UserId) => {
  try {
    data["createdAt"] = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
    data["updatedAt"] = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

    // console.log(data, "data");

    if (!data.AddToCartId) {
      data.AddToCartId = Date.now().toString(); // You can also prepend a prefix or make this more complex if needed
    }

    const existingItem = await Cart.findOne({
      UserId: UserId,
      SKU: data.SKU, // Match SKU along with UserId
      IsCheckout: false,
      IsDelete: false,
    });

    // console.log(existingItem, "existingItem");

    if (existingItem) {


      return {
        statusCode: 200,
        message: "Item already in the cart",
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
  // console.log(req.body, "req.body");
  // const token = req.headers["authorization"]?.split(" ")[1];
  // if (!token) {
  //   return res.status(401).json({ message: "Unauthorized" });
  // }
  try {
    const UserId = req.body.UserId;
    // console.log(UserId, "11111");
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

const orderDetails = async () => {
  const orders = await Cart.aggregate([
    {
      $match: {
        IsDelete: false, 
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
      $lookup: {
        from:"stocks",
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

  if (orders.length === 0) {
    return {
      statusCode: 404,
      message: "No users found.",
    };
  }

  const cartCount = orders.length; 
  // console.log("orders", cartCount);


  return {
    TotalCount: cartCount,
    statusCode: orders.length > 0 ? 200 : 204,
    message:
      orders.length > 0 ? "orders retrieved successfully" : "No orders found",
    data: orders,
  };
};

router.get("/orderdetail", async function (req, res) {
  try {
    const result = await orderDetails();

    res.status(result.statusCode).json({result});
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

module.exports = router;
