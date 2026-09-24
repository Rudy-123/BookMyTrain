const Redis = require("ioredis");
const { config } = require(".");
const logger = require("./logger");
const { error } = require("winston");

class RedisClient {
  static instance;
  static isConnected = false;

  constructor() {}

  static getInstance() {
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis(config.REDIS_URL, {
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      });
      RedisClient.setupEventListeners();
    }
    return RedisClient.instance;
  }

  static setupEventListeners() {
    RedisClient.instance.on("connect", () => {
      RedisClient.isConnected = true;
      logger.info("Connected to Redis");
    });
    RedisClient.instance.on("error", (err) => {
      logger.error("Redis Connection Error:", err.message);
    });
    RedisClient.instance.on("close", () => {
      RedisClient.isConnected = false;
      logger.info("Connection to Redis Closed");
    });
    RedisClient.instance.on("reconnecting", () => {
      logger.warn("Reconnecting to Redis...");
    });

    RedisClient.instance.on("ready", () => {
      RedisClient.isConnected = true;
      logger.warn("Redis client is ready");
    });

    RedisClient.instance.on("end", () => {
      RedisClient.isConnected = false;
      logger.warn("Redis connection ended");
    });
  }

  static async closeConnection() {
    await RedisClient.instance.quit();
  }

  static isReady() {
    return RedisClient.isConnected;
  }

  static async testConnection() {
    try {
      await RedisClient.instance.ping();
      return true;
    } catch (error) {
      logger.error("Redis Connection test failed !", error);
      return false;
    }
  }
}

module.exports = {
  redis: RedisClient.getInstance(),
  RedisClient,
};
