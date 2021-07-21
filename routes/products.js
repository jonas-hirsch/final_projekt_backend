const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { body } = require("express-validator");

const validateTitleAndDescription = [
  body("title").isLength({ min: 5 }),
  body("description").isLength({ min: 20 }),
];
/* GET users listing. */
router.get("/", productController.getAllProducts);
router.post(
  "/",
  validateTitleAndDescription,
  productController.createNewProduct
);
router.put(
  "/:id",
  validateTitleAndDescription,
  productController.updateProduct
);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
