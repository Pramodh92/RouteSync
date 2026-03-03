/**
 * dynamo.js — DynamoDB service for RouteSync
 *
 * Tables used:
 *   routesync-users    — PK: userId (String)
 *   routesync-bookings — PK: bookingId (String), SK: userId (String)
 *   routesync-routes   — PK: routeId (String)
 *
 * Auth: uses the EC2 instance's IAM role (VanguardEC2Role).
 * No access keys needed when running on EC2.
 * Locally: set AWS_REGION + AWS credentials in .env or ~/.aws/credentials
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    QueryCommand,
    UpdateCommand,
    DeleteCommand,
} from '@aws-sdk/lib-dynamodb';

// ─── Client Setup ────────────────────────────────────────────────────────────
const rawClient = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
    // On EC2 with VanguardEC2Role → credentials come from instance metadata automatically.
    // Locally → set AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY in server/.env
});

const db = DynamoDBDocumentClient.from(rawClient, {
    marshallOptions: { removeUndefinedValues: true },
});

// ─── Table Names ─────────────────────────────────────────────────────────────
const TABLES = {
    USERS: process.env.DYNAMO_USERS_TABLE || 'routesync-users',
    BOOKINGS: process.env.DYNAMO_BOOKINGS_TABLE || 'routesync-bookings',
    ROUTES: process.env.DYNAMO_ROUTES_TABLE || 'routesync-routes',
};

// ─── USERS ───────────────────────────────────────────────────────────────────

/** Save or overwrite a user item */
export async function putUser(user) {
    await db.send(new PutCommand({ TableName: TABLES.USERS, Item: user }));
}

/** Get a single user by userId */
export async function getUserById(userId) {
    const { Item } = await db.send(new GetCommand({
        TableName: TABLES.USERS,
        Key: { userId },
    }));
    return Item || null;
}

/** Update specific fields on a user */
export async function updateUser(userId, fields) {
    const keys = Object.keys(fields);
    if (!keys.length) return;

    const ExpressionAttributeNames = {};
    const ExpressionAttributeValues = {};
    const sets = keys.map((k, i) => {
        ExpressionAttributeNames[`#f${i}`] = k;
        ExpressionAttributeValues[`:v${i}`] = fields[k];
        return `#f${i} = :v${i}`;
    });

    await db.send(new UpdateCommand({
        TableName: TABLES.USERS,
        Key: { userId },
        UpdateExpression: `SET ${sets.join(', ')}`,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
    }));
}

// ─── BOOKINGS ────────────────────────────────────────────────────────────────

/** Save a new booking */
export async function putBooking(booking) {
    await db.send(new PutCommand({ TableName: TABLES.BOOKINGS, Item: booking }));
}

/** Get a single booking by bookingId + userId */
export async function getBooking(bookingId, userId) {
    const { Item } = await db.send(new GetCommand({
        TableName: TABLES.BOOKINGS,
        Key: { bookingId, userId },
    }));
    return Item || null;
}

/** Get all bookings for a user using the userId-index GSI */
export async function getBookingsByUser(userId) {
    const { Items = [] } = await db.send(new QueryCommand({
        TableName: TABLES.BOOKINGS,
        IndexName: 'userId-index',
        KeyConditionExpression: 'userId = :uid',
        ExpressionAttributeValues: { ':uid': userId },
    }));
    return Items.sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));
}

/** Update booking status (e.g. cancel) */
export async function updateBookingStatus(bookingId, userId, status, extra = {}) {
    const ExpressionAttributeNames = { '#s': 'status' };
    const ExpressionAttributeValues = { ':s': status };
    let updateExpr = 'SET #s = :s';

    Object.entries(extra).forEach(([k, v], i) => {
        ExpressionAttributeNames[`#e${i}`] = k;
        ExpressionAttributeValues[`:e${i}`] = v;
        updateExpr += `, #e${i} = :e${i}`;
    });

    await db.send(new UpdateCommand({
        TableName: TABLES.BOOKINGS,
        Key: { bookingId, userId },
        UpdateExpression: updateExpr,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
    }));
}

export { db, TABLES };
