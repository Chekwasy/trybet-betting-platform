import { MongoClient } from "mongodb";
import { attachDatabasePool } from "@vercel/functions";

// Extend globalThis properly for TypeScript
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Please define MONGODB_URI in env");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!globalThis._mongoClientPromise) {
  client = new MongoClient(uri);

  // Attach Vercel DB pooling optimization
  attachDatabasePool(client);

  globalThis._mongoClientPromise = client.connect();
}

clientPromise = globalThis._mongoClientPromise;

class DBClient {
  async isAlive(): Promise<boolean> {
    try {
      const db = await this.db();
      await db.command({ ping: 1 });
      return true;
    } catch {
      return false;
    }
  }

  async db(dbName?: string) {
    const client = await clientPromise;
    return client.db(dbName);
  }

  async nbUsers(): Promise<number> {
    const db = await this.db();
    return db.collection("users").estimatedDocumentCount();
  }

  async nbDates(): Promise<number> {
    const db = await this.db();
    return db.collection("dates").estimatedDocumentCount();
  }
}

const dbClient = new DBClient();
export default dbClient;
