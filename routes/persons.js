const express = require("express");
const router = express.Router();
const personController = require("../controllers/personController");
const { body } = require("express-validator");

const validateUserValues = [
  //email,password,firstName,lastName
  body("email").isEmail(),
  body("password").isLength({ min: 5 }),
  body("firstName").isLength({ min: 3 }),
  body("lastName").isLength({ min: 3 }),
];

router.get("/", personController.getAllPersons);
router.get("/:id", personController.getSinglePerson);
router.post("/", validateUserValues, personController.createNewPerson);
router.put("/:id", validateUserValues, personController.updatePerson);
router.patch("/role/:id", personController.setRole);
router.delete("/:id", personController.deletePerson);

module.exports = router;
