import mongoose from "mongoose";
import dotenv from "dotenv";
import winston from "winston";

dotenv.config();

// Setup Winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(
      ({ timestamp, level, message }) => `[${timestamp}] ${level}: ${message}`
    )
  ),
  transports: [new winston.transports.Console()],
});

const connectDB = async () => {
  const options = {
    autoIndex: true,           
    maxPoolSize: 10,           
    serverSelectionTimeoutMS: 5000, 
    socketTimeoutMS: 45000,    
  };

  const connectWithRetry = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI, options);
      logger.info("✅ MongoDB Connected Successfully");
    } catch (error) {
      logger.error(`❌ MongoDB Connection Error: ${error.message}`);
      logger.info("🔁 Retrying connection in 5 seconds...");
      setTimeout(connectWithRetry, 5000); // Retry after 5 seconds
    }
  };

  connectWithRetry();
};

// Optional: Log connection events
mongoose.connection.on("disconnected", () =>
  logger.warn("⚠️ MongoDB disconnected! Attempting to reconnect...")
);
mongoose.connection.on("reconnected", () =>
  logger.info("🔄 MongoDB reconnected successfully")
);

export default connectDB;
