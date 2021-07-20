const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

/* GET users listing. */
router.get("/", productController.getAllProducts);

module.exports = router;
