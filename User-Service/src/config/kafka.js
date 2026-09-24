const { Kafka, logLevel } = require("kafkajs");
const logger = require("./logger");
const config = require(".");
const kafka = new Kafka({
  clientId: config.KAFKA_CLIENT_ID,
  brokers: [config.KAFKA_BROKER || "localhost:9093"], //single broker
  logLevel: logLevel.ERROR,
  retry: {
    initialRetryTime: 300,
    retries: 8,
    maxRetryTime: 30000,
  },
});

const producer = kafka.producer({
  allowAutoTopicCreation: true,
  transactionTimeout: 30000,
  idempotent: true,
  maxInFlightRequests: 5,
  retry: {
    retries: 5,
  },
});

let isConnected = false;
const connectProducer = async () => {
  if (!isConnected) {
    await producer.connect();
    isConnected = true;
    logger.info("Kafka Producer Connected");
  }
};

const disconnectProducer = async () => {
  if (isConnected) {
    await producer.disconnect();
    isConnected = false;
    logger.info("Kafka Producer Disconnected");
  }
};
process.on("SIGTERM", disconnectProducer);
process.on("SIGINT", disconnectProducer);
module.exports = { kafka, producer, connectProducer, disconnectProducer };
