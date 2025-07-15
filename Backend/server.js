import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { FWeatherData } from "./weatherServer.js"; 

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
let latestLocationData = null;
dotenv.config();

app.get("/weather", async (req, res) => {
  console.log('Running weather function.....')
  const lat = req.query.lat;
  const lon = req.query.lon;
  const apiKey = process.env.WEATHER_API_KEY;

  if (!lat || !lon) {
    return res.status(200).json({ error: "Missing lat or lon in query params" });
  }

  try {
    const data = await FWeatherData(lat, lon, apiKey);
    res.status(200).json({data: data, message: "weather data fetched successfully"});
  } catch (error) {
    res.status(200).json({ error: error.message });
  }
});

let latestData = null; 
app.post('/uploadLocation', (req, res) => {
  const { coords, polygon_arr } = req.body;

  if (!coords || !polygon_arr) {
    return res.status(200).json({ error: "Missing coordinates or polygon data" });
  }

  latestData = {
    lat: coords.lat,
    lon: coords.lon,
    radius: req.body.radius || "N/A", 
    pointCount: polygon_arr.length,
    timestamp: new Date().toLocaleString()
  };

  console.log("📥 Received Location Data:", latestData);

  res.json({ message: "✅ Location data received successfully", data: latestData });
});

app.get("/view", (req, res) => {
  if (!latestData) {
    return res.send("<h3>❌ No data uploaded yet.</h3>");
  }

  res.send(`
    <h2>📍 Latest Uploaded Location</h2>
    <ul>
      <li><strong>Latitude:</strong> ${latestData.lat}</li>
      <li><strong>Longitude:</strong> ${latestData.lon}</li>
      <li><strong>Radius:</strong> ${latestData.radius} ha</li>
      <li><strong>Points in Polygon:</strong> ${latestData.pointCount}</li>
      <li><strong>Timestamp:</strong> ${latestData.timestamp}</li>
    </ul>
  `);
});



const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
