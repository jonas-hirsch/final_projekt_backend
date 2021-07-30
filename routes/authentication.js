const express = require("express");
const authenticationRouter = express.Router();

const {
  login,
  register,
  getUserInformation,
} = require("../controllers/authenticationController");

authenticationRouter.post("/login", login);
authenticationRouter.post("/register", register);
authenticationRouter.get("/me", getUserInformation);

module.exports = authenticationRouter;
