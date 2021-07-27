const express = require("express");
const router = express.Router();
const customerOrderController = require("../controllers/customerOrderController");

const validateDate = (time, res) => {
  if (!time) {
    return res.status(400).send("Date is required");
  }
  const dateTime = new Date(time);
  if (!(dateTime instanceof Date) || isNaN(dateTime)) {
    return res.status(400).send("Valide Date is required");
  }
  return true;
};
const validateOrderDate = (req, res, next) => {
  const { orderTime } = req.body;
  const result = validateDate(orderTime, res);
  if (result === true) {
    next();
  }
};
const validateShippingDate = (req, res, next) => {
  const { shippingTime } = req.body;
  const result = validateDate(shippingTime, res);
  if (result === true) {
    next();
  }
};

const validateShippingDateValidOrNull = (req, res, next) => {
  const { shippingTime } = req.body;
  if (!shippingTime) {
    return next();
  }
  const result = validateDate(shippingTime, res);
  if (result === true) {
    next();
  }
};

router.get("/", customerOrderController.getAllCustomerOrders);
router.get("/id/:id", customerOrderController.getOrderByOrderId);
router.get("/user/:userId", customerOrderController.getCustomerOrdersByUser);
router.post(
  "/",
  validateOrderDate,
  validateShippingDateValidOrNull,
  customerOrderController.createCustomerOrder
);
router.put("/:id", customerOrderController.updateCustomerOrder);
router.put(
  "/shippingInformation/:id",
  validateShippingDate,
  customerOrderController.setShippingInformation
);
router.patch(
  "/setShippingTime/:id",
  validateShippingDate,
  customerOrderController.setOrderShippingTime
);
router.patch("/trackingNumber/:id", customerOrderController.setTrackingNumber);
router.delete("/:id", customerOrderController.deleteCustomerOrder);

module.exports = router;
