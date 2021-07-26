const express = require("express");
const router = express.Router();
const shoppingCardController = require("../controllers/shoppingCardController");
const { body } = require("express-validator");

const validateProductAmount = [body("amount").isInt({ min: 0 })];

router.get("/all", shoppingCardController.getAllShoppingCardItems);
router.get("/user/:id", shoppingCardController.getShoppingCarItemsByUserId);
router.post(
  "/single",
  validateProductAmount,
  shoppingCardController.createNewShoppingCardItem
);
router.put(
  "/:id",
  validateProductAmount,
  shoppingCardController.updateShoppingCardItem
);
router.delete(
  "/deleteSingle/:id",
  shoppingCardController.deleteSingleShoppingCardItemById
);
router.delete(
  "/deleteByUser/:userId",
  shoppingCardController.deleteShoppingCardItemsByUserId
);

module.exports = router;
