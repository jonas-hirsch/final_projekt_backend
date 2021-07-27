const express = require("express");
const router = express.Router();
const orederItemController = require("../controllers/addressController");
const { body } = require("express-validator");

router.get("/", orederItemController.getAllAddresses);
router.get("/id/:id", orederItemController.getAddressById);
router.get("/person/:personId", orederItemController.getAddressesByPerson);
router.post("/", orederItemController.createNewAddress);
router.put("/:id", orederItemController.updateAddress);
router.patch("/:id", orederItemController.setAddressToPrimary);
router.delete("/:id", orederItemController.deleteAddress);

module.exports = router;
