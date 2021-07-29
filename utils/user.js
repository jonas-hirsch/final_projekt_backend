const jwt = require("jsonwebtoken");

const createToken = (id) => {
  const payload = { _id: id };
  const secretKey = process.env.JWT_SECRET;
  // set the expiry date as an option: { expiresIn: "1h" }
  const token = jwt.sign(payload, secretKey);
  return token;
};
// trainerSchema.methods.createToken =
// const Trainer = mongoose.model("Trainer", trainerSchema);

module.exports = { createToken };
