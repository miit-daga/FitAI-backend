const express = require("express");
const {
    addFitnessDataHandler,
    getAllFitnessDataHandler,
    getUserFitnessDataHandler,
    updateFitnessDataHandler,
    deleteFitnessDataHandler,
    addNutritionDataHandler,
    getNutritionDataHandler,
    addWaterDataHandler,
    getWaterDataHandler,
    addActivityDataHandler,
    getActivityDataHandler,
    addSettingsDataHandler,
    getSettingsDataHandler
} = require("../controllers/fitnessController");

const router = express.Router();

router.get("/", getAllFitnessDataHandler);
router.get("/:userId", getUserFitnessDataHandler);
router.post("/", addFitnessDataHandler);
router.put("/:userId", updateFitnessDataHandler);
router.delete("/:userId", deleteFitnessDataHandler);

// Nutrition Routes
router.post('/nutrition', addNutritionDataHandler);
router.get('/nutrition/:userId', getNutritionDataHandler);

// Water Routes
router.post('/water', addWaterDataHandler);
router.get('/water/:userId', getWaterDataHandler);

// Activity Routes
router.post('/activity', addActivityDataHandler);
router.get('/activity/:userId', getActivityDataHandler);

// Settings Routes
router.post('/settings', addSettingsDataHandler);
router.get('/settings/:userId', getSettingsDataHandler);

module.exports = router;