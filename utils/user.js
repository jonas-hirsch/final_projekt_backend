const jwt = require("jsonwebtoken");

const destructToken = (token) => {
  const secretKey = process.env.JWT_SECRET;
  jwt.verify(token.split(" ")[1], secretKey, (err, verifiedJwt) => {
    if (err) {
      throw Error(err.message);
    } else {
      return verifiedJwt;
    }
  });
};

const createToken = (id) => {
  const payload = { _id: id };
  const secretKey = process.env.JWT_SECRET;
  // set the expiry date as an option: { expiresIn: "1h" }
  const token = jwt.sign(payload, secretKey);
  return token;
};

module.exports = { createToken, destructToken };
