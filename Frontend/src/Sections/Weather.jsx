"use client";
import React, { useCallback, useContext, useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import { CiLocationOn } from "react-icons/ci";
import { get_lat_lon } from "../Operations/Lat_Lon";
import { get_current_user, getWeatherStatus } from "../Components/Functions";
import { UserContext } from "../context/UserContext";
import Footer from '../Components/Footer';

const Weather = () => {
  // State
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [weather_status, setWeather_status] = useState("")
  const [weather_data, setWeather_data] = useState({
    status: "",
    temp: 0.0,
    feels_like: 0.0,
    min_temp: 0.0,
    max_temp: 0.0,
    pressure: 0,
    humidity: 0,
    sea_level: 0,
    ground_level: 0,
    wind_speed: 0.0,
    wind_gust: 0.0,
    wind_deg: 0,
    rain: 0.0,
    clouds: 0,
    location: "",
  });

  const { user, setUser } = useContext(UserContext)
  console.log(user)
  console.log(latitude)
  console.log(longitude)
  console.log(weather_status)

  // Get Weather from Backend API
  const get_current_weather = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/weather/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "user_id": user.id,
          "lat": latitude,
          "lon": longitude
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch weather");

      const result = await response.json();
      console.log(result);

      setWeather_data({
        clouds: result.clouds || 0,
        feels_like: result.feels_like || 0.0,
        ground_level: result.ground_level || 0,
        humidity: result.humidity || 0,
        pressure: result.pressure || 0,
        sea_level: result.sea_level || 0,
        temp: result.temp || 0.0,
        max_temp: result.max_temp || 0.0,
        min_temp: result.min_temp || 0.0,
        rain: result.rain || 0.0,
        status: result.status || "",
        location: result.location || "",
        wind_deg: result.wind_degree || 0,
        wind_gust: result.wind_gust || 0.0,
        wind_speed: result.wind_speed || 0.0,
      });
    } catch (err) {
      console.error("❌ Weather fetch error:", err);
    }
  });

  // Get lat/lon from browser
  const getLocation = async () => {
    const { lat, lon } = await get_lat_lon();
    setLatitude(lat);
    setLongitude(lon);
  };

  // Helpers
  const kelvinToCelsius = (k) => (k - 273.15).toFixed(1);

  // USE EFFECT
  useEffect(() => {
    const init = async () => {
      const data = await get_current_user();
      setUser(data);

      getLocation(); // Trigger geolocation update
      setWeather_status(getWeatherStatus(weather_data.min_temp, weather_data.max_temp, weather_data.humidity, weather_data.rain))
    };

    init();
  }, []);

  useEffect(() => {
    if (user && latitude !== null && longitude !== null) {
      get_current_weather();
    }
  }, [user, latitude, longitude]);

  return (
    <div className="relative">
      {/* Background Image */}
      <img
        src="/weather_bg.png"
        alt="background_img"
        className="absolute w-full h-full object-cover -z-50"
      />

      <Navbar />

      {/* Main Body */}
      <main className="pt-[100px] px-6 min-h-screen flex justify-center items-center gap-5 border border-white text-white">
        {/* Left Section */}
        <div className="h-full w-[45%] flex flex-col gap-5">
          <div className="backdrop-blur-sm border border-white rounded-xl flex justify-between items-center">
            <div className="flex flex-col items-start px-5">
              <span className="flex items-center gap-1 text-sm py-1 px-2 m-2 border rounded-full">
                <CiLocationOn /> {weather_data.location}
              </span>
              <div className="flex flex-col items-start m-2">
                <h3 className="text-2xl">Weather</h3>
                <p>Now</p>
              </div>
              <span className="text-5xl mx-2 mt-2 pt-3">{kelvinToCelsius(weather_data.temp)} °C</span>
              <span className="text-sm m-2">Feels like {kelvinToCelsius(weather_data.feels_like)} °C</span>
            </div>
            <div>
              <img
                src={`/${weather_status}.png`}
                alt="weather_status"
                className="h-40 p-5"
              />
              <div className="w-full text-center p-1 text-xl">{weather_status}</div>
            </div>
          </div>

          {/* Temperature & Humidity etc. */}
          <div className="backdrop-blur-sm border border-white rounded-xl flex flex-col justify-around items-center">
            <ul className="flex justify-around items-center w-full p-5">
              {[
                ["Min", kelvinToCelsius(weather_data.min_temp)],
                ["Max", kelvinToCelsius(weather_data.max_temp)],
                ["Pres", weather_data.pressure],
                ["RH", weather_data.humidity],
                ["Sea", weather_data.sea_level],
                ["Gnd", weather_data.ground_level],
              ].map(([label, value], i) => (
                <li
                  key={i}
                  className="flex flex-col items-center gap-3 border border-slate-300 p-2 rounded-md"
                >
                  <div>{label}</div>
                  <p>{value}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Section */}
        <div className="h-full w-[45%]">
          {/* Wind Section */}
          <div className="backdrop-blur-sm border border-white rounded-xl py-4">
            <h3 className="w-full text-center p-2 text-4xl font-bold">Wind</h3>
            <ul className="flex justify-around items-center py-2">
              {[
                ["Speed", weather_data.wind_speed],
                ["Deg", weather_data.wind_deg],
                ["Gust", weather_data.wind_gust],
              ].map(([label, value], i) => (
                <li
                  key={i}
                  className="flex flex-col items-center gap-7 border border-slate-300 p-2 rounded-md text-xl"
                >
                  <h3>{label}</h3>
                  <p>{value}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Rain & Clouds */}
          <ul className="py-4 flex justify-around items-center">
            {[
              ["Rain", weather_data.rain],
              ["Clouds", weather_data.clouds],
            ].map(([label, value], i) => (
              <li
                key={i}
                className="w-[45%] p-5 border backdrop-blur-sm border-slate-300 rounded-xl flex flex-col gap-5"
              >
                <h3 className="text-left text-sm">{label}</h3>
                <p className="text-center text-5xl font-semibold">{value}</p>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Weather;
