const express = require("express");
const router = express.Router();
const orederItemController = require("../controllers/orderItemController");

router.get("/", orederItemController.getAllOrderItems);
router.get("/id/:id", orederItemController.getOrderItemById);
router.get("/order/:orderId", orederItemController.getOrderItemByOrder);
router.post("/", orederItemController.createNewOrderItem);
router.put("/:id", orederItemController.updateOrderItem);
router.delete("/:id", orederItemController.deleteOrderItem);

module.exports = router;
