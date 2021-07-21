const express = require("express");
const router = express.Router();
const productController = require("../controllers/productMediaController");
const upload = require("../utils/fileUpload");

router.get("/:productId", productController.getMediaForProduct);
router.post(
  "/:productId",
  upload.array("media"),
  productController.uploadProductMedia
);
router.delete("/:id", productController.deleteMedia);
module.exports = router;
