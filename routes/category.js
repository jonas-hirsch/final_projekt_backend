const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { body } = require("express-validator");

const validateCategoryData = [body("name").isLength({ min: 3 })];

router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
router.post("/", validateCategoryData, categoryController.createNewCategory);
router.put("/:id", validateCategoryData, categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);
module.exports = router;
