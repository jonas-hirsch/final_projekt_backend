const express = require("express");
const router = express.Router();
const orederItemController = require("../controllers/orderItemController");
const { body } = require("express-validator");

const validateQuantityAndPrice = [
  body("price")
    .isFloat({ min: 0, max: 1000000 })
    .withMessage("The price of a product must be between 0 and 1000000."),
  body("amount")
    .isInt({ min: 1, max: 1000000 })
    .withMessage("The quantity must be at least 1."),
];

router.get("/", orederItemController.getAllOrderItems);
router.get("/id/:id", orederItemController.getOrderItemById);
router.get("/order/:orderId", orederItemController.getOrderItemByOrder);
router.post(
  "/",
  validateQuantityAndPrice,
  orederItemController.createNewOrderItem
);
router.put(
  "/:id",
  validateQuantityAndPrice,
  orederItemController.updateOrderItem
);
router.delete("/:id", orederItemController.deleteOrderItem);

module.exports = router;
