const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { body } = require("express-validator");

router.post("/checkout/:userId", orderController.checkout);
router.post("/cancelOrder/:orderId", orderController.cancelOrder);

module.exports = router;
