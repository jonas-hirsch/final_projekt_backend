const express = require("express");
const router = express.Router();
const orederItemController = require("../controllers/addressController");
const { body } = require("express-validator");

const validateCategoryData = [
  body("street").isLength({ min: 3 }),
  body("houseNumber").isLength({ min: 1 }),
  body("city").isLength({ min: 3 }),
  body("postcode").isLength({ min: 3 }),
  body("country").isLength({ min: 3 }),
];

router.get("/", orederItemController.getAllAddresses);
router.get("/id/:id", orederItemController.getAddressById);
router.get("/person/:personId", orederItemController.getAddressesByPerson);
router.post("/", validateCategoryData, orederItemController.createNewAddress);
router.put("/:id", validateCategoryData, orederItemController.updateAddress);
router.patch("/:id", orederItemController.setAddressToPrimary);
router.delete("/:id", orederItemController.deleteAddress);

module.exports = router;
