var express = require("express");
var router = express.Router();
var jwt = require("jsonwebtoken");
const SECRET_KEY = "your_secret_key";

router.use(function (req, res, next) {
  var token = req.headers["authorization"];
  if (token) {
    jwt.verify(token,SECRET_KEY,
      {
        algorithm: "HS256"
      },
      function (err, decoded) {
        if (err) {
          let errordata = {
            message: err.message,
            expiredAt: err.expiredAt,
          };
          console.log(errordata);
          return res.status(401).json({
            message: "Unauthorized Access",
          });
        }
        req.decoded = decoded;
        req.id = decoded.UserId
        next();
      }
    );
  } else {
    return res.status(403).json({
      error: "tocken needed",
    });
  }
});

module.exports = router;
