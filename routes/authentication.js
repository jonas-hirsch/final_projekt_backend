const express = require("express");
const authenticationRouter = express.Router();

const { login, register } = require("../controllers/authenticationController");

authenticationRouter.post("/login", login);
authenticationRouter.post("/register", register);

module.exports = authenticationRouter;
