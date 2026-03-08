import mongoose from "mongoose";

export async function connectMongo() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/swm";
  mongoose.set("strictQuery", true);
  if (uri === "memory") {
    try {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      await mongoose.connect(memUri, { dbName: process.env.MONGO_DB || "swm" });
      console.log(`[DB] Mongo connected (memory) db=${process.env.MONGO_DB || "swm"}`);
    } catch (e) {
      console.warn("[DB] mongodb-memory-server not available; continuing without Mongo connection");
    }
  } else {
    await mongoose.connect(uri, {
      dbName: process.env.MONGO_DB || "swm",
    });
    console.log(`[DB] Mongo connected uri=${uri} db=${process.env.MONGO_DB || "swm"}`);
  }
}
