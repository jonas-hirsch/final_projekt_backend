const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { body } = require("express-validator");
const upload = require("../utils/fileUpload");

const validateTitleAndDescription = [
  body("title").isLength({ min: 5 }),
  body("description").isLength({ min: 20 }),
];

/* GET users listing. */
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getSingleProduct);
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
