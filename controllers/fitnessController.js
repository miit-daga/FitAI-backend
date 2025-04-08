const {
    addFitnessData,
    getAllFitnessData,
    getUserFitnessData,
    updateFitnessData,
    deleteFitnessData,
    addNutritionData,
    getNutritionData,
    addWaterData,
    getWaterData,
    addActivityData,
    getActivityData,
    addSettingsData,
    getSettingsData
} = require("../models/fitnessData");

async function addFitnessDataHandler(req, res) {
    try {
        const { userId, steps, caloriesBurned, sleepHours, heartRate, waterIntake, recentActivities, nutrition } = req.body;
        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }
        const response = await addFitnessData(userId, { steps, caloriesBurned, sleepHours, heartRate, waterIntake, recentActivities, nutrition });
        res.status(201).json(response);
    } catch (error) {
        console.error("Error adding fitness data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function updateFitnessDataHandler(req, res) {
    try {
        const { userId } = req.params;
        const { steps, caloriesBurned, sleepHours, heartRate, waterIntake, recentActivities, nutrition } = req.body;

        if (!steps && !caloriesBurned && !sleepHours && !heartRate && !waterIntake && !recentActivities && !nutrition) {
            return res.status(400).json({ error: "At least one field is required to update" });
        }

        const response = await updateFitnessData(userId, { steps, caloriesBurned, sleepHours, heartRate, waterIntake, recentActivities, nutrition });
        res.status(200).json(response);
    } catch (error) {
        console.error("Error updating fitness data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function getAllFitnessDataHandler(req, res) {
    try {
        const data = await getAllFitnessData();
        res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching all fitness data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function getUserFitnessDataHandler(req, res) {
    try {
        const { userId } = req.params;
        const data = await getUserFitnessData(userId);
        if (!data) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching user fitness data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function deleteFitnessDataHandler(req, res) {
    try {
        const { userId } = req.params;
        const response = await deleteFitnessData(userId);
        res.status(200).json(response);
    } catch (error) {
        console.error("Error deleting fitness data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
async function addNutritionDataHandler(req, res) {
    try {
        const { userId, date, mealName, calories, protein, carbs, fat } = req.body;
        const response = await addNutritionData(userId, { date, mealName, calories, protein, carbs, fat });
        res.status(201).json(response);
    } catch (error) {
        console.error("Error adding nutrition data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function getNutritionDataHandler(req, res) {
    try {
        const { userId } = req.params;
        const data = await getNutritionData(userId);
        res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching nutrition data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function addWaterDataHandler(req, res) {
    try {
        const { userId, date, ml } = req.body;
        const response = await addWaterData(userId, { date, ml });
        res.status(201).json(response);
    } catch (error) {
        console.error("Error adding water data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function getWaterDataHandler(req, res) {
    try {
        const { userId } = req.params;
        const data = await getWaterData(userId);
        res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching water data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function addActivityDataHandler(req, res) {
    try {
        const { userId, type, duration, caloriesBurned, date } = req.body;
        const response = await addActivityData(userId, { type, duration, caloriesBurned, date });
        res.status(201).json(response);
    } catch (error) {
        console.error("Error adding activity data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function getActivityDataHandler(req, res) {
    try {
        const { userId } = req.params;
        const data = await getActivityData(userId);
        res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching activity data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function addSettingsDataHandler(req, res) {
    try {
        const { userId, name, email, height, weight, birthdate, gender } = req.body;
        const response = await addSettingsData(userId, { name, email, height, weight, birthdate, gender });
        res.status(201).json(response);
    } catch (error) {
        console.error("Error adding settings data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function getSettingsDataHandler(req, res) {
    try {
        const { userId } = req.params;
        const data = await getSettingsData(userId);
        res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching settings data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
module.exports = {
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
};
