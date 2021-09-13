const express = require("express");
const router = express.Router();
const payment = require("../controllers/paymentController")

router.use(express.static("."));


router.get("/:id", payment.createPayment);

module.exports = router;


