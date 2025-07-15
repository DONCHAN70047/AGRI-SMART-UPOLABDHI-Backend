"use client";
import React, { useEffect } from "react";
import Navbar from "../Components/Navbar";
import {
    CiLocationOn
} from "react-icons/ci";
import { useState } from "react";
import { get_lat_lon } from "../Operations/Lat_Lon";

const Weather = () => {

    // State List
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
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
        location: ""
    })

    // API Calls
    const get_current_weather = async (params) => {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/get_current_weather`)
        const result = await response.json()
        console.log(result)
        setWeather_data({
            clouds: result.clouds.all,
            feels_like: result.main.feels_like,
            ground_level: result.main.grnd_level,
            humidity: result.main.humidity,
            pressure: result.main.pressure,
            sea_level: result.main.sea_level,
            temp: result.main.temp,
            max_temp: result.main.temp_max,
            min_temp: result.main.temp_min,
            rain: result.rain?.["1h"],
            status: result.weather[0].main,
            location: result.base,
            wind_deg: result.wind.deg,
            wind_gust: result.wind.gust,
            wind_speed: result.wind.speed
        })
    }


    const getLocation = async () => {
        const { lat, lon } = await get_lat_lon()
        setLatitude(lat)
        setLongitude(lon)
    }

    const kelvinToCelsius = (k) => (k - 273.15).toFixed(1);

    const formatTime = (timestamp) =>
        new Date(timestamp * 1000).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
        });

    const getWeatherStatus = ({ min, max, humidity, rain }) => {
        const avg = (min + max) / 2;

        if (rain > 0 && humidity > 65 && avg > 25) return "Monsoon";
        if (rain > 0) return "Rainy";
        if (avg <= 10) return "Freezing";
        if (avg <= 18) return "Cold";
        if (avg <= 25) return "Pleasant";
        if (avg <= 30) return "Warm";
        if (avg <= 35) return "Hot";
        if (avg <= 40) return "Very_hot";
        return "Scorching";
    };

    useEffect(() => {
        getLocation()
        get_current_weather()
    }, [latitude, longitude])


    return (
        <>
            <div>
                <Navbar />

                {/* Background Image */}
                <img
                    src="/weather_bg.png"
                    alt="background_img"
                    className="absolute w-full h-full object-cover -z-50"
                />

                {/* Main Body  */}
                <main className="pt-[100px] px-6 min-h-screen flex justify-center items-center gap-5 border border-white text-white">

                    {/* Left Section  */}
                    <div className="h-full w-[45%] flex flex-col gap-5">
                        {/* Temperature Details  */}
                        <div className="backdrop-blur-sm border border-white rounded-xl object-contain flex justify-between items-center">
                            <div className="flex flex-col justify-around items-start px-5">
                                <span className="flex justify-center items-center gap-1 text-sm py-1 px-2 m-2 border rounded-full"><CiLocationOn /> {weather_data.location}</span>
                                <div className="flex flex-col items-start m-2">
                                    <h3 className="text-2xl">Weather</h3>
                                    <p>Now</p>
                                </div>
                                <span className="text-5xl mx-2 mt-2 pt-3">{kelvinToCelsius(weather_data.temp)} °C</span>
                                <span className="text-sm m-2">Feels like {kelvinToCelsius(weather_data.feels_like)} °C</span>
                            </div>
                            <div>
                                <img
                                    src={`/${weather_data.status}.jpg`}
                                    alt="weather_status"
                                    className="h-48 p-5"
                                />
                                <div className="w-full text-center p-1 text-2xl">{weather_data.status}</div>
                            </div>
                        </div>
                        <div className="backdrop-blur-sm border border-white rounded-xl flex flex-col justify-around items-center">
                            <ul className="flex justify-around items-center w-full p-5">
                                <li className="flex flex-col justify-around items-center gap-3 border border-slate-300 p-2 rounded-md">
                                    <div>Min</div>
                                    <p>{kelvinToCelsius(weather_data.min_temp)}</p>
                                </li>
                                <li className="flex flex-col justify-around items-center gap-3 border border-slate-300 p-2 rounded-md">
                                    <div>Max</div>
                                    <p>{kelvinToCelsius(weather_data.max_temp)}</p>
                                </li>
                                <li className="flex flex-col justify-around items-center gap-3 border border-slate-300 p-2 rounded-md">
                                    <div>Pres</div>
                                    <p>{weather_data.pressure}</p>
                                </li>
                                <li className="flex flex-col justify-around items-center gap-3 border border-slate-300 p-2 rounded-md">
                                    <div>RH</div>
                                    <p>{weather_data.humidity}</p>
                                </li>
                                <li className="flex flex-col justify-around items-center gap-3 border border-slate-300 p-2 rounded-md">
                                    <div>Sea</div>
                                    <p>{weather_data.sea_level}</p>
                                </li>
                                <li className="flex flex-col justify-around items-center gap-3 border border-slate-300 p-2 rounded-md">
                                    <div>Gnd</div>
                                    <p>{weather_data.ground_level}</p>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Section  */}
                    <div className="h-full w-[45%]">
                        {/* Wind Section  */}
                        <div className="backdrop-blur-sm border border-white rounded-xl py-4">
                            <h3 className="w-full text-center p-2 text-4xl font-bold">Wind</h3>
                            <ul className="flex justify-around items-center py-2">
                                <li className="flex flex-col justify-around items-center gap-7 border border-slate-300 p-2 rounded-md text-xl">
                                    <h3>Speed</h3>
                                    <p>{weather_data.wind_speed}</p>
                                </li>
                                <li className="flex flex-col justify-around items-center gap-7 border border-slate-300 p-2 rounded-md text-xl">
                                    <h3>Deg</h3>
                                    <p>{weather_data.wind_deg}</p>
                                </li>
                                <li className="flex flex-col justify-around items-center gap-7 border border-slate-300 p-2 rounded-md text-xl">
                                    <h3>Gust</h3>
                                    <p>{weather_data.wind_gust}</p>
                                </li>
                            </ul>
                        </div>

                        {/* Rain & Clouds  */}
                        <ul className=" py-4 flex justify-around items-center">
                            <li className="w-[45%] p-5 border backdrop-blur-sm border-slate-300 rounded-xl flex flex-col gap-5">
                                <h3 className="w-full h-[10%] text-left text-sm">Rain</h3>
                                <p className="w-full text-center text-5xl font-semibold">{weather_data.rain}</p>
                            </li>
                            <li className="w-[45%] p-5 border backdrop-blur-sm border-slate-300 rounded-xl flex flex-col gap-5">
                                <h3 className="w-full h-[10%] text-left text-sm">Clouds</h3>
                                <p className="w-full text-center text-5xl font-semibold">{weather_data.clouds}</p>
                            </li>
                        </ul>
                    </div>

                </main>
            </div>
        </>
    );
};

export default Weather;
