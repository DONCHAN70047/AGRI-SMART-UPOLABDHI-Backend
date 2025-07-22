import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../Components/Navbar';
import { get_lat_lon } from '../Operations/Lat_Lon';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { get_current_user } from '../Components/Functions';
import Footer from '../Components/Footer';

const Get_your_map = () => {
  const [message, setMessage] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState('');
  const [user, setUser] = useState(null)

  console.log(user)

  const mapRef = useRef(null);
  const polygonRef = useRef(null);

  const uploadLocation = async () => {
    if (!latitude || !longitude) {
      setMessage('❗ Please get your location and select radius first');
      return;
    }

    const polygon_arr = generateCircleAroundPoint(Number(latitude), Number(longitude), Number(radius));

    const request_body = {
      coords: {
        lat: latitude,
        lon: longitude,
      },
      polygon_arr: polygon_arr,
      user_id: user.id
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/get_your_map/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request_body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || 'Upload failed');
      }

      setMessage('✅ Location uploaded successfully!');
    } catch (err) {
      console.error('Upload Error:', err);
      setMessage('❌ Failed to upload location');
    }
  };

  const getLocation = async () => {
    try {
      const { lat, lon } = await get_lat_lon();
      setLatitude(lat);
      setLongitude(lon);
      setMessage('📍 Location fetched successfully!');
    } catch (error) {
      console.error('Location Error:', error);
      setMessage('❌ Failed to fetch location');
    }
  };

  const handleChange = (e) => {
    setRadius(e.target.value);
  };

  const generateCircleAroundPoint = (latitude, longitude, radiusHectares) => {
    const EARTH_RADIUS = 6371000;
    const areaInSqMeters = radiusHectares * 10000;
    const radius = Math.sqrt(areaInSqMeters / Math.PI);
    const numPoints = Math.max(24, Math.floor(radius / 5));

    const coords = [];

    for (let i = 0; i <= numPoints; i++) {
      const angle = (2 * Math.PI * i) / numPoints;
      const dx = radius * Math.cos(angle);
      const dy = radius * Math.sin(angle);
      const deltaLat = (dy / EARTH_RADIUS) * (180 / Math.PI);
      const deltaLng = (dx / (EARTH_RADIUS * Math.cos((Math.PI * latitude) / 180))) * (180 / Math.PI);
      coords.push([latitude + deltaLat, longitude + deltaLng]);
    }

    return coords;
  };

  useEffect(() => {
    if (latitude && longitude && document.getElementById('map') && !mapRef.current) {
      const map = L.map('map').setView([latitude, longitude], 13);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup('📍 You are here!')
        .openPopup();
    }
  }, [latitude, longitude]);

  useEffect(() => {
    if (!mapRef.current || !latitude || !longitude || !radius) return;

    if (polygonRef.current) {
      mapRef.current.removeLayer(polygonRef.current);
    }

    const circleCoords = generateCircleAroundPoint(Number(latitude), Number(longitude), Number(radius));
    const polygon = L.polygon(circleCoords, {
      color: 'blue',
      fillColor: '#3b82f6',
      fillOpacity: 0.3,
    }).addTo(mapRef.current);

    polygonRef.current = polygon;
    mapRef.current.fitBounds(polygon.getBounds());
  }, [radius, latitude, longitude]);

  useEffect(() => {
    const func = async () => {
      const data = await get_current_user()
      setUser(data)
    }
    func()
  }, [])


  return (
    <div className="relative min-h-screen">
      <Navbar />

      <img
        src="/Get_your_map_bg.png"
        alt="background_img"
        className="absolute w-full h-full object-cover -z-50"
      />

      <main className="pt-[100px] px-6 min-h-[calc(100vh)] flex items-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10 w-full">

          {/* Left Box */}
          <div className="w-full md:w-1/2 min-h-[400px] p-6 bg-white/30 backdrop-blur-lg rounded-2xl border-2 border-white shadow-2xl flex flex-col items-center justify-around gap-6">
            <h2 className="text-3xl font-bold text-gray-800">🌍 Get your Map 🌍</h2>
            <p className="text-base text-gray-700">Know your exact location within 2 minutes.</p>
            <p className="text-sm italic text-green-700">{message}</p>

            {latitude && longitude && (
              <p className="text-md text-gray-600">Lat: {latitude} | Lon: {longitude}</p>
            )}

            <div className="max-w-xs mx-auto my-4">
              <label htmlFor="radius" className="block text-sm font-medium text-gray-700 mb-2">
                Select Radius (hectares)
              </label>
              <select
                id="radius"
                name="radius"
                value={radius}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="" disabled>Select a value</option>
                {Array.from({ length: 15 }, (_, i) => i + 1).map((val) => (
                  <option key={val} value={val}>{val} ha</option>
                ))}
              </select>
            </div>

            <div className="flex gap-6">
              <button onClick={getLocation} className="px-6 py-2 bg-green-600 text-white rounded-full shadow-md hover:bg-green-700 transition">
                Get Location
              </button>
              <button onClick={uploadLocation} className="px-6 py-2 bg-green-600 text-white rounded-full shadow-md hover:bg-green-700 transition">
                Upload Location
              </button>
            </div>
          </div>

          {/* Right Box */}
          <div className="w-full md:w-1/2 h-72 md:h-[400px] bg-white/30 backdrop-blur-lg border-2 border-white rounded-2xl shadow-2xl flex items-center justify-center text-gray-700">
            {!latitude || !longitude ? (
              <div className="text-lg">🗺️ Map will appear here</div>
            ) : (
              <div id="map" className="h-full w-full overflow-hidden rounded-2xl"></div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Get_your_map;
