import { MongoClient, Db } from "mongodb";

console.log("MONGO_URL", process.env.MONGO_URL)

export const mongoClient = new MongoClient(process.env.MONGO_URL!);
let _db: Db;

export async function initializeDb() {
    try {
        await mongoClient.connect();
        _db = mongoClient.db("tribunal-de-justica");
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Failed to connect to MongoDB", error);
        process.exit(1);
    }
}

export function getDb() {
    if (!_db) {
        throw Error("Database not initialized");
    }
    return _db;
}
