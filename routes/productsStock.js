const express = require("express");
const router = express.Router();
const productStockController = require("../controllers/productStockController");
const { body } = require("express-validator");

const validatePrice = [
  body("price")
    .isFloat({ min: 0, max: 1000000 })
    .optional({ nullable: true })
    .withMessage("The price of a product must be between 0 and 1000000."),
  body("discountRelative")
    .isInt({ min: 0, max: 100 })
    .optional({ nullable: true })
    .withMessage("The discount must be between 0 and 100%."),
  body("discountAbsolute")
    .isFloat({ min: 0, max: 1000000 })
    .optional({ nullable: true })
    .withMessage("The discount must be between 0 and 1000000."),
];

const validateQuantity = [
  body("quantity")
    .isInt({ min: 0, max: 1000000 })
    .withMessage("The quantity must not be negative."),
];

const validateDateRange = (req, res, next) => {
  const { valideFrom, valideTo } = req.body;
  const currentTime = new Date();
  if (valideFrom) {
    const fromDate = new Date(valideFrom);
    if (fromDate <= currentTime) {
      return res.status(400).send("Start date must be in the future");
    }
  }
  if (valideTo) {
    const toDate = new Date(valideTo);
    if (toDate <= currentTime) {
      return res.status(400).send("End date must be in the future");
    }
  }
  if (valideFrom && valideTo) {
    const fromDate = new Date(valideFrom);
    const toDate = new Date(valideTo);

    if (toDate <= fromDate) {
      return res.status(400).send("The end date must be after the start date.");
    }
  }
  next();
};
router.get("/all", productStockController.getAllStock);
router.get("/:productId", productStockController.getAvailableStockForProduct);
router.get("/id/:id", productStockController.getStockById);
router.put(
  "/:id",
  validatePrice,
  validateDateRange,
  validateQuantity,
  productStockController.updateStockObject
);
router.post(
  "/:productId",
  validatePrice,
  validateDateRange,
  validateQuantity,
  productStockController.addNewStockObjectForProduct
);
router.patch(
  "/changeAbsolute/:id",
  validateQuantity,
  productStockController.setStockQuantityAbsolute
);
router.patch(
  "/changeRelative/:id",
  productStockController.changeStockQuantityRelative
);
router.delete("/:id", productStockController.deleteStock);
module.exports = router;
