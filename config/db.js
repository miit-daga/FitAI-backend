const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, ScanCommand, GetCommand, UpdateCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
require("dotenv").config();

const client = new DynamoDBClient({
    region: "ap-south-1",
    credentials: {
        accessKeyId: "AKIAQ3EGREIEG5JB2WXZ",
        secretAccessKey: "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",
    }
});

const dynamoDB = DynamoDBDocumentClient.from(client);
const TABLE_NAME = "FitnessData";
const TABLE_NAME_USER = "Users";
const USER_DETAILS="Details"

module.exports = { dynamoDB, TABLE_NAME, TABLE_NAME_USER, USER_DETAILS,PutCommand, ScanCommand, GetCommand, UpdateCommand, DeleteCommand };


