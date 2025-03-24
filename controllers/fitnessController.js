const {
    addFitnessData,
    getAllFitnessData,
    getUserFitnessData,
    updateFitnessData,
    deleteFitnessData
} = require("../models/fitnessData");

// Add Fitness Data
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

// Update Fitness Data
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

// Get All Fitness Data
async function getAllFitnessDataHandler(req, res) {
    try {
        const data = await getAllFitnessData();
        res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching all fitness data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// Get User Fitness Data
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

// Delete User Fitness Data
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

module.exports = {
    addFitnessDataHandler,
    getAllFitnessDataHandler,
    getUserFitnessDataHandler,
    updateFitnessDataHandler,
    deleteFitnessDataHandler
};
