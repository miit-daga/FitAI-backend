const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, ScanCommand, GetCommand, UpdateCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
require("dotenv").config();

const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

const dynamoDB = DynamoDBDocumentClient.from(client);
const TABLE_NAME = "FitnessData"; 

module.exports = { dynamoDB, TABLE_NAME, PutCommand, ScanCommand, GetCommand, UpdateCommand, DeleteCommand };
