import { MongoClient, type Db } from 'mongodb'

export const mongoClient = new MongoClient(process.env.MONGO_URL ?? 'mongodb://localhost:27017')
let _db: Db

export async function initializeDb (): Promise<void> {
  try {
    await mongoClient.connect()
    _db = mongoClient.db('tj')
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('Failed to connect to MongoDB', error)
    process.exit(1)
  }
}

export function getDb (): Db {
  if (!_db) {
    throw Error('Database not initialized')
  }
  return _db
}
