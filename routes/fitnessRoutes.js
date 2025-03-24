const express = require("express");
const {
    addFitnessDataHandler,
    getAllFitnessDataHandler,
    getUserFitnessDataHandler,
    updateFitnessDataHandler,
    deleteFitnessDataHandler
} = require("../controllers/fitnessController");

const router = express.Router();

router.get("/", getAllFitnessDataHandler);       // Get all fitness data
router.get("/:userId", getUserFitnessDataHandler); // Get a specific user's fitness data
router.post("/", addFitnessDataHandler);        // Add fitness data
router.put("/:userId", updateFitnessDataHandler); // Update fitness data for a user
router.delete("/:userId", deleteFitnessDataHandler); // Delete fitness data for a user

module.exports = router;
