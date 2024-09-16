import express from "express";
import redis from "redis";
import { exec } from "child_process";

const app = express();
const redisClient = redis.createClient({
  url: "redis://redis:6379"
});

// Conecta a Redis
redisClient.on("error", (err) => console.log("Redis Client Error", err));
await redisClient.connect();

// Ruta para consultar DNS con caché
app.get("/resolve/:domain", async (req, res) => {
  const domain = req.params.domain;

  // Revisa si el dominio ya está en caché
  const cachedIP = await redisClient.get(domain);
  if (cachedIP) {
    return res.json({ domain, ip: cachedIP, source: "cache" });
  }

  // Si no está en caché, realiza la consulta DNS usando 'dig'
  exec(`dig +short ${domain}`, async (error, stdout) => {
    if (error) {
      return res.status(500).json({ error: "DNS lookup failed" });
    }

    const ip = stdout.trim();
    if (!ip) {
      return res.status(404).json({ error: "Domain not found" });
    }

    // Almacena el resultado en Redis (caché) con expiración de 60 segundos
    await redisClient.setEx(domain, 60, ip);

    res.json({ domain, ip, source: "dns" });
  });
});

// Iniciar el servidor
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});