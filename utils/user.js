const jwt = require("jsonwebtoken");
const personController = require("../controllers/personController");

const destructToken = async (token) => {
  const secretKey = process.env.JWT_SECRET;
  return await jwt.verify(
    token.split(" ")[1],
    secretKey,
    async (err, verifiedJwt) => {
      if (err) {
        throw Error(err.message);
      } else {
        const userEmail = verifiedJwt._id;
        const req = { body: { email: userEmail } };
        try {
          const user = await personController.getSinglePersonByEmail(req);

          return user;
        } catch (error) {
          console.error(error);
          return null;
        }
      }
    }
  );
};

const createToken = (id) => {
  const payload = { _id: id };
  const secretKey = process.env.JWT_SECRET;
  // set the expiry date as an option: { expiresIn: "1h" }
  const token = jwt.sign(payload, secretKey);
  return token;
};

module.exports = { createToken, destructToken };
