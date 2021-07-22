const express = require("express");
const router = express.Router();
const personController = require("../controllers/personController");
const { body } = require("express-validator");

router.get("/", personController.getAllPersons);
router.get("/:id", personController.getSinglePerson);
router.post("/", personController.createNewPerson);
router.put("/:id", personController.updatePerson);
router.patch("/userLevel/:id", personController.setRole);
router.delete("/:id", personController.deletePerson);

module.exports = router;
