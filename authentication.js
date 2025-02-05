const crypto = require("crypto-js");
const secretKey = process.env.SECRET_KEY;

const encryptData = (data) => {
  const ciphertext = crypto.AES.encrypt(data, secretKey).toString();
  return ciphertext;
};

const decryptData = (ciphertext) => {
  const bytes = crypto.AES.decrypt(ciphertext, secretKey);
  const originalText = bytes.toString(crypto.enc.Utf8);
  return originalText;
};

const createToken = (userData) => {
  const expirationTime = Date.now() + 4 * 60 * 60 * 1000;
  // const expirationTime = Date.now() + 1;
  const dataWithExpiration = { ...userData, exp: expirationTime };

  const token = encryptData(JSON.stringify(dataWithExpiration), secretKey);
  return token;
};

const verifyToken = (token) => {
  const decryptedData = decryptData(token, secretKey);

  if (!decryptedData) {
    return { message: "Token invalid" };
  }

  const parsedData = JSON.parse(decryptedData);

  if (Date.now() > parsedData.exp) {
    return { message: "Token expired" };
  }

  return parsedData;
};

const verifyLoginToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const idHeader = req.headers["id"];
    const token = authHeader && authHeader.split(" ")[1];
    const id = idHeader && idHeader.split(" ")[1];

    // check bearer token
    if (!token || !id) {
      return res.status(401).json({
        statusCode: 401,
        message: "Authorization token and Id is required",
      });
    }

    // verify token
    const data = await verifyToken(token);
    if (data.message) {
      if (!data) {
        return res.status(401).json({
          statusCode: 401,
          error: data.message,
        });
      }
    }

    if (
      id !== data.superAdminId &&
      id !== data.companyId &&
      id !== data.CustomerId &&
      id !== data.WorkerId
    ) {
      return res.status(401).json({
        statusCode: 401,
        error: "User is not verify",
      });
    }
    req.tokenData = data;
    req.CompanyId = data.companyId;
    req.Role = data.role;
    req.userName = data.full_name;

    next();
  } catch (error) {
    console.error(error);
    // return apiResponse({
    return res.status(500).json({
      statusCode: 500,
      message: "Authorization token is expired or invalid",
    });
  }
};

module.exports = {
  encryptData,
  decryptData,
  createToken,
  verifyToken,
  verifyLoginToken,
};
