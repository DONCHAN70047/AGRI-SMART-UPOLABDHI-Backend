import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { FWeatherData } from "./weatherServer.js"; 

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/weather", async (req, res) => {
  const lat = req.query.lat;
  const lon = req.query.lon;
  const apiKey = "95f8797edb05380c3d79d3c94f4609cb";

  if (!lat || !lon) {
    return res.status(400).json({ error: "Missing lat or lon in query params" });
  }

  try {
    const data = await FWeatherData(lat, lon, apiKey);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
