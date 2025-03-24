const { dynamoDB, TABLE_NAME, PutCommand, ScanCommand, GetCommand, UpdateCommand, DeleteCommand } = require("../config/db");

// Add Fitness Data
async function addFitnessData(userId, data) {
    const params = new PutCommand({
        TableName: TABLE_NAME,
        Item: {
            userId,
            ...data
        }
    });
    await dynamoDB.send(params);
    return { message: "Fitness data added successfully!" };
}

// Get All Fitness Data
async function getAllFitnessData() {
    const params = new ScanCommand({ TableName: TABLE_NAME });
    const data = await dynamoDB.send(params);
    return data.Items;
}

// Get Fitness Data for a Specific User
async function getUserFitnessData(userId) {
    const params = new GetCommand({
        TableName: TABLE_NAME,
        Key: { userId }
    });
    const data = await dynamoDB.send(params);
    return data.Item || null;
}

// Update Fitness Data for a User
async function updateFitnessData(userId, data) {
    let updateExpression = "set ";
    let expressionAttributeValues = {};
    let hasUpdates = false;

    for (const key in data) {
        if (data[key] !== undefined) {
            updateExpression += `${key} = :${key}, `;
            expressionAttributeValues[`:${key}`] = data[key];
            hasUpdates = true;
        }
    }

    if (!hasUpdates) {
        throw new Error("No fields provided for update");
    }

    updateExpression = updateExpression.slice(0, -2);

    const params = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { userId },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "UPDATED_NEW",
    });

    await dynamoDB.send(params);
    return { message: "Fitness data updated successfully!" };
}

// Delete Fitness Data for a User
async function deleteFitnessData(userId) {
    const params = new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { userId }
    });

    await dynamoDB.send(params);
    return { message: "Fitness data deleted successfully!" };
}

module.exports = {
    addFitnessData,
    getAllFitnessData,
    getUserFitnessData,
    updateFitnessData,
    deleteFitnessData
};
