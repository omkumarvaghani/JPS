const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY;

const createToken = (userData) => {
  const expirationTime = "4h";
  const token = jwt.sign(
    {
      SuperadminId: userData.SuperadminId,
    },
    secretKey,
    { expiresIn: expirationTime }
  );
  return token;
};

const verifyToken = (token) => {
  try {
    const decodedData = jwt.verify(token, secretKey);
    return decodedData;
  } catch (error) {
    return null;
  }
};

const verifyLoginToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const idHeader = req.headers["id"];

    if (!authHeader || !idHeader) {
      return res.status(401).json({
        statusCode: 401,
        message: "Authorization token and Id are required",
      });
    }

    const token = authHeader.split(" ")[1];
    const id = idHeader.split(" ")[1];

    if (!token || !id) {
      return res.status(401).json({
        statusCode: 401,
        message: "Invalid token or ID format",
      });
    }

    const data = verifyToken(token);

    if (!data) {
      return res.status(401).json({
        statusCode: 401,
        message: "Invalid or expired token",
      });
    }

    if (id != data.SuperadminId) {
      return res.status(401).json({
        statusCode: 401,
        message: "User is not verified or ID mismatch",
      });
    }
    req.tokenData = data;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      statusCode: 500,
      message: "Authorization token is expired or invalid",
    });
  }
};

module.exports = {
  createToken,
  verifyLoginToken,
};
