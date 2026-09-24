const axios = require("axios");
const { config } = require("../config");
const logger = require("../config/logger");

const client = axios.create({
  baseURL: config.ADMIN_SERVICE_URL, // Using ADMIN_SERVICE_URL for stations
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "x-internal-service-key": config.INTERNAL_SERVICE_KEY,
  },
});

async function withRetry(fn, maxRetries = 3) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const status = error.response?.status;
      if (status && status >= 400 && status < 500) throw error;

      if (attempt < maxRetries) {
        const delay = 200 * Math.pow(2, attempt - 1);
        logger.warn(`Station client retry ${attempt}/${maxRetries} after ${delay}ms`, { error: error.message });
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

const stationClient = {
  async getStationById(stationId) {
    return withRetry(async () => {
      const { data } = await client.get(`/stations/${stationId}`);
      return data.data;
    });
  }
};

module.exports = { stationClient };
