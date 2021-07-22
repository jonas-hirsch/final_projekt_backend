const express = require("express");
const router = express.Router();
const productStockController = require("../controllers/productStockController");
const upload = require("../utils/fileUpload");

router.get("/", productStockController.getAllStock);
router.get("/:productId", productStockController.getAvailableStockForProduct);
router.put("/:id", productStockController.updateStockObject);
router.post("/:productId", productStockController.addNewStockObjectForProduct);
router.patch(
  "/changeAbsolute/:id",
  productStockController.setStockQuantityAbsolute
);
router.patch(
  "/changeRelative/:id",
  productStockController.changeStockQuantityRelative
);
router.delete("/:id", productStockController.deleteStock);
module.exports = router;
