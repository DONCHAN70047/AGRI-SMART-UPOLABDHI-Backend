import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../Components/Navbar';
import { get_lat_lon } from '../Operations/Lat_Lon';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Get_your_map = () => {

    // State List
    const [message, setMessage] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [radius, setRadius] = useState("")

    // Reference List
    const mapRef = useRef(null);
    const polygonRef = useRef(null);


    // API Calls
    const uploadLocation = async () => {
        const polygon_arr = generateCircleAroundPoint(latitude, longitude, radius);
        const request_body = {
            coords: {
                lat: latitude,
                lon: longitude
            },
            polygon_arr: polygon_arr
        }
        console.log(request_body)
        const responce = await fetch(`${import.meta.env.VITE_BACKEND_URL}/uploadLocation`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: request_body
        })
        const result = await responce.json()
        return { responce, result }
    }

    // Get Location
    const getLocation = async () => {
        const { lat, lon } = await get_lat_lon()
        setLatitude(lat)
        setLongitude(lon)
    }

    const handleChange = (e) => {
        const value = e.target.value;
        setRadius(value); // You already handle state here
    };


    function generateCircleAroundPoint(latitude, longitude, radiusHectares) {
        const EARTH_RADIUS = 6371000; // in meters
        const areaInSqMeters = radiusHectares * 10000;
        const radius = Math.sqrt(areaInSqMeters / Math.PI); // meters

        // Number of points based on radius: more points for bigger radius
        const numPoints = Math.max(24, Math.floor(radius / 5)); // Adjust granularity

        const coords = [];

        for (let i = 0; i <= numPoints; i++) {
            const angle = (2 * Math.PI * i) / numPoints;

            // Offset in meters
            const dx = radius * Math.cos(angle);
            const dy = radius * Math.sin(angle);

            // Convert meter offset to lat/lng
            const deltaLat = (dy / EARTH_RADIUS) * (180 / Math.PI);
            const deltaLng = (dx / (EARTH_RADIUS * Math.cos((Math.PI * latitude) / 180))) * (180 / Math.PI);

            const lat = latitude + deltaLat;
            const lng = longitude + deltaLng;

            coords.push([lat, lng]);
        }

        return coords;
    }

    // UseEffects
    useEffect(() => {
        console.log(latitude);
        console.log(longitude);

    }, [latitude, longitude])

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

        // Clear existing polygon
        if (polygonRef.current) {
            mapRef.current.removeLayer(polygonRef.current);
        }

        const circleCoords = generateCircleAroundPoint(Number(latitude), Number(longitude), Number(radius));

        const latlngs = circleCoords.map(([lat, lng]) => [lat, lng]);

        const polygon = L.polygon(latlngs, {
            color: 'blue',
            fillColor: '#3b82f6',
            fillOpacity: 0.3,
        }).addTo(mapRef.current);

        polygonRef.current = polygon;

        // Fit map to polygon
        mapRef.current.fitBounds(polygon.getBounds());

    }, [radius, latitude, longitude]);



    return (
        <div className="relative min-h-screen">
            <Navbar />

            {/* Background Image */}
            <img
                src="/Get_your_map_bg.png"
                alt="background_img"
                className="absolute w-full h-full object-cover -z-50"
            />

            {/* Main body */}
            <main className="pt-[100px] px-6 min-h-[calc(100vh-100px)] flex items-center">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10 w-full">

                    {/* Left Box – Map Info */}
                    <div className="w-full md:w-1/2 min-h-[400px] p-6  bg-white/30 backdrop-blur-lg rounded-2xl border-2 border-white shadow-2xl flex flex-col items-center justify-around gap-6">
                        <div className="flex flex-col justify-around items-center gap-7">
                            <h2 className="text-3xl font-bold text-gray-800">🌍 Get your Map 🌍</h2>
                            <p className="text-base text-gray-700">Know your exact location within 2 minutes.</p>
                        </div>

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
                                    <option key={val} value={val}>
                                        {val} ha
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-6">
                            <button onClick={() => { getLocation() }} className="px-6 py-2 bg-green-600 text-white rounded-full shadow-md hover:bg-green-700 transition duration-200">
                                Get Location
                            </button>
                            <button onClick={() => { uploadLocation() }} className="px-6 py-2 bg-green-600 text-white rounded-full shadow-md hover:bg-green-700 transition duration-200">
                                Upload Location
                            </button>
                        </div>
                    </div>


                    {/* Right Box – Map Display */}
                    <div className="w-full md:w-1/2 h-72 md:h-[400px] bg-white/30 backdrop-blur-lg border-2 border-white rounded-2xl shadow-2xl flex items-center justify-center text-gray-700">
                        {latitude.length === 0 && longitude.length === 0 ? (
                            <div className="text-lg">🗺️ Map will appear here</div>
                        ) : (
                            <div id='map' className='h-full w-full overflow-hidden rounded-2xl'></div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Get_your_map;
