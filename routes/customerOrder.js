const express = require("express");
const router = express.Router();
const customerOrderController = require("../controllers/customerOrderController");
const { body } = require("express-validator");

// const validateProductAmount = [body("amount").isInt({ min: 0 })];

router.get("/", customerOrderController.getAllCustomerOrders);
router.get("/id/:id", customerOrderController.getOrderByOrderId);
router.get("/user/:userId", customerOrderController.getCustomerOrdersByUser);
router.post("/", customerOrderController.createCustomerOrder);
router.put("/:id", customerOrderController.updateCustomerOrder);
router.put(
  "/shippingInformation/:id",
  customerOrderController.setShippingInformation
);
router.patch(
  "/setShippingTime/:id",
  customerOrderController.setOrderShippingTime
);
router.patch("/trackingNumber/:id", customerOrderController.setTrackingNumber);
router.delete("/:id", customerOrderController.deleteCustomerOrder);

module.exports = router;
