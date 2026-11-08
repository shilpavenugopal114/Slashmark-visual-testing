require('dotenv').config();
const mongoose = require('mongoose');

let memoryServer = null;
let connectionPromise = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    const uri = process.env.ATLAS_URI || process.env.MONGO_URI;

    // Try cloud/local URI only if valid and not the defunct sample cluster
    if (uri && !uri.includes('cluster0.v3ybcds.mongodb.net')) {
      try {
        await mongoose.connect(uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 3000
        });
        console.log('Connected to MongoDB via URI');
        return mongoose.connection;
      } catch (err) {
        console.log('MongoDB URI connection failed. Falling back to in-memory MongoDB...');
      }
    }

    // Fallback to MongoMemoryServer for automated testing & local execution
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      if (!memoryServer) {
        memoryServer = await MongoMemoryServer.create();
      }
      const memoryUri = memoryServer.getUri();
      await mongoose.connect(memoryUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('Connected to In-Memory MongoDB at', memoryUri);
      return mongoose.connection;
    } catch (err) {
      console.error('Failed to initialize MongoDB:', err);
      throw err;
    }
  })();

  return connectionPromise;
}

async function closeDB() {
  connectionPromise = null;
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

module.exports = { connectDB, closeDB };
