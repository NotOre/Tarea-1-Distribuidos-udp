import express from "express";
import csv from "csv-parser";
import redis from "redis";
import fs from "fs";

const app = express();

const redisClient = redis.createClient({
  url: "redis://redis:6379"
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

(async () => {
  await redisClient.connect();
  console.log("Connected to Redis");
})();

const results = [];

fs.createReadStream('./archivo_limitado_1.csv')
  .pipe(csv(['Domain']))
  .on('error', (error) => console.log("Error reading CSV file:", error))
  .on('data', (row) => {


    results.push(row);
  })
  .on('end', async () => {
    console.log("First 5 results from CSV:", results.slice(0, 5));


    const limitedResults = results.slice(0, 1000);


    for (let i = 0; i < limitedResults.length; i++) {
      const domainKey = `domain:${i}`;
      await redisClient.set(domainKey, JSON.stringify(limitedResults[i]));
    }

    console.log(`Stored ${limitedResults.length} entries in Redis.`);
  });

app.get("/", async (req, res) => {
  try {
    const cachedData = await redisClient.get("domain:0");
    if (cachedData) {
      res.json({ message: "Data from Redis cache", data: JSON.parse(cachedData) });
    } else {
      res.json({ message: "No data found in Redis cache" });
    }
  } catch (err) {
    console.log("Error fetching from Redis:", err);
    res.status(500).json({ error: "Error fetching data from Redis" });
  }
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});