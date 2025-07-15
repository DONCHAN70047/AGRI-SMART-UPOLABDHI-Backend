import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { FWeatherData } from "./weatherServer.js"; 
import { exec } from 'child_process';




dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
let latestLocationData = null;
dotenv.config();

// ...................................................... UploadLocation..............................................
app.post('/UploadLocation', (req, res) => {
    console.log('Running UploadLocation function.....')
    const { coords, polygon_arr } = req.body;

    if (!coords || !polygon_arr) {
        return res.status(200).json({ error: "Missing coordinates or polygon data" });
    }

    //console.log('Latitude:', coords.lat);
    //console.log('Longitude:', coords.lon);
    //console.log('Polygon Array:', polygon_arr);
    const lat = coords.lat;
    const lon = coords.lon;
    const polygonJSON = JSON.stringify(polygon_arr).replace(/"/g, '\\"');

    const command = `python Database/LocationDataStore.py ${lat} ${lon} "${polygonJSON}"`;

    exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(` Python Error: ${error.message}`);
      return;
    }

    
    res.json({ success: true, message: 'Location data received!' 
      
    });
});
});

// ...................................................... WeatherDetails..............................................
app.get("/weather", (req, res) => {
  console.log("Running weather function.....");

  const command = "python Database/GetLatestLatLon.py";

  exec(command, async (error, stdout, stderr) => {
    if (error) {
      console.error(`Python Error: ${error.message}`);
      return res.status(500).json({ error: "Python script failed" });
    }

    try {
      const parsed = JSON.parse(stdout);
      if (parsed.error) {
        return res.status(404).json(parsed);
      }

      const lat = parsed.lat;
      const lon = parsed.lon;
      const apiKey = process.env.WEATHER_API_KEY;

      if (!lat || !lon) {
        return res.status(400).json({ error: "Missing lat or lon in database" });
      }

      try {
        const data = await FWeatherData(lat, lon, apiKey);
        res.json(data); 
      } catch (fetchError) {
        res.status(500).json({ error: fetchError.message });
      }
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr);
      res.status(500).json({ error: "Failed to parse Python output" });
    }
  });
});




const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
