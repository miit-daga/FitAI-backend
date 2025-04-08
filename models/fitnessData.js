const { dynamoDB, TABLE_NAME,TABLE_NAME_USER,USER_DETAILS, PutCommand, ScanCommand, GetCommand, UpdateCommand, DeleteCommand } = require("../config/db");

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

async function getAllFitnessData() {
    const params = new ScanCommand({ TableName: TABLE_NAME });
    const data = await dynamoDB.send(params);
    return data.Items;
}

async function getUserFitnessData(userId) {
    const params = new GetCommand({
        TableName: TABLE_NAME,
        Key: { userId }
    });
    const data = await dynamoDB.send(params);
    return data.Item || null;
}

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

async function deleteFitnessData(userId) {
    const params = new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { userId }
    });

    await dynamoDB.send(params);
    return { message: "Fitness data deleted successfully!" };
}

async function userExists(userId) {
    const params = new GetCommand({
        TableName: TABLE_NAME_USER,
        Key: { userId }
    });
    const data = await dynamoDB.send(params);
    return !!data.Item;
}

async function addNutritionData(userId, data) {
    if (!await userExists(userId)) {
        return { error: "User does not exist" };
    }
    const params = new UpdateCommand({
        TableName: USER_DETAILS,
        Key: { userId },
        UpdateExpression: "SET nutrition = list_append(if_not_exists(nutrition, :emptyList), :n)",
        ExpressionAttributeValues: {
            ":n": [data],
            ":emptyList": []
        }
    });
    await dynamoDB.send(params);
    return { message: "Nutrition data added successfully!" };
}

async function addWaterData(userId, data) {
    if (!await userExists(userId)) {
        return { error: "User does not exist" };
    }
    const params = new UpdateCommand({
        TableName: USER_DETAILS,
        Key: { userId },
        UpdateExpression: "SET water = list_append(if_not_exists(water, :emptyList), :w)",
        ExpressionAttributeValues: {
            ":w": [data],
            ":emptyList": []
        }
    });
    await dynamoDB.send(params);
    return { message: "Water data added successfully!" };
}

async function addActivityData(userId, data) {
    if (!await userExists(userId)) {
        return { error: "User does not exist" };
    }
    const params = new UpdateCommand({
        TableName: USER_DETAILS,
        Key: { userId },
        UpdateExpression: "SET activity = list_append(if_not_exists(activity, :emptyList), :a)",
        ExpressionAttributeValues: {
            ":a": [data],
            ":emptyList": []
        }
    });
    await dynamoDB.send(params);
    return { message: "Activity data added successfully!" };
}

async function addSettingsData(userId, data) {
    if (!await userExists(userId)) {
        return { error: "User does not exist" };
    }
    const params = new UpdateCommand({
        TableName: USER_DETAILS,
        Key: { userId },
        UpdateExpression: "SET settings = :s",
        ExpressionAttributeValues: {
            ":s": data
        }
    });
    await dynamoDB.send(params);
    return { message: "Settings data updated successfully!" };
}


async function getNutritionData(userId) {
    const params = new GetCommand({
        TableName: USER_DETAILS,
        Key: { userId }
    });
    const data = await dynamoDB.send(params);
    return data.Item && data.Item.nutrition ? data.Item.nutrition : [];
}

async function getWaterData(userId) {
    const params = new GetCommand({
        TableName: USER_DETAILS,
        Key: { userId }
    });
    const data = await dynamoDB.send(params);
    return data.Item && data.Item.water ? data.Item.water : [];
}

async function getActivityData(userId) {
    const params = new GetCommand({
        TableName: USER_DETAILS,
        Key: { userId }
    });
    const data = await dynamoDB.send(params);
    return data.Item && data.Item.activity ? data.Item.activity : [];
}

async function getSettingsData(userId) {
    const params = new GetCommand({
        TableName: USER_DETAILS,
        Key: { userId }
    });
    const data = await dynamoDB.send(params);
    return data.Item && data.Item.settings ? data.Item.settings : [];
}
module.exports = {
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
};