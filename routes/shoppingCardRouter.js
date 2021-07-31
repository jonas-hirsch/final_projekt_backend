const express = require("express");
const router = express.Router();
const shoppingCardController = require("../controllers/shoppingCardController");
const { body } = require("express-validator");

const validateProductAmount = [body("amount").isInt({ min: 0 })];
const validateBulkInsert = (req, res, next) => {
  try {
    if (!req.body) {
      throw Error("Invalid body");
    }
    if (!Array.isArray(req.body)) {
      throw Error("An array of products is required.");
    }
    req.body.forEach((element) => {
      if (element.amount < 0) {
        return res
          .status(400)
          .send("Error: The amound of products must be positive");
      }
    });
    next();
  } catch (error) {
    console.error(error);
    return res.status(400).send(error.message);
  }
};

router.get("/all", shoppingCardController.getAllShoppingCardItems);
router.get("/user/:id", shoppingCardController.getShoppingCarItemsByUserId);
router.post(
  "/single",
  validateProductAmount,
  shoppingCardController.createNewShoppingCardItem
);
router.post(
  "/singleByStockId/:stockId",
  validateProductAmount,
  shoppingCardController.createNewShoppingCardItemByStockId
);
router.post(
  "/many",
  validateBulkInsert,
  shoppingCardController.createManyNewShoppingCardItems
);
router.post(
  "/manyByStock/:userId",
  shoppingCardController.createManyNewShoppingCardItemsByStockId
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
