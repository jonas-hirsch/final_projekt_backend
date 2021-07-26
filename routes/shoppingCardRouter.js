const express = require("express");
const router = express.Router();
const shoppingCardController = require("../controllers/shoppingCardController");

router.get("/all", shoppingCardController.getAllShoppingCardItems);
router.get("/user/:id", shoppingCardController.getShoppingCarItemsByUserId);
router.post("/", shoppingCardController.createNewShoppingCardItem);
router.put("/:id", shoppingCardController.updateShoppingCardItem);
router.delete(
  "/deleteSingle/:id",
  shoppingCardController.deleteSingleShoppingCardItemById
);
router.delete(
  "/deleteByUser/:userId",
  shoppingCardController.deleteShoppingCardItemsByUserId
);

module.exports = router;
