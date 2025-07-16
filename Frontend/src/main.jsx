import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import './index.css'

import App from './App.jsx'
import Login from './Sections/Login.jsx'
import Signup from './Sections/Signup';
import Get_your_map from './Sections/Get_your_map.jsx';
import Weather from './Sections/Weather.jsx';
import Dashboard from './Sections/Dashboard.jsx';
import Crop_disease from './Sections/Crop_disease.jsx';
import Nearby_market from './Sections/Nearby_market.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/home" element={<App />} />
      <Route path="/login" element={<Login />} /> 
      <Route path="/signup" element={<Signup />} />
      <Route path="/Get_your_map" element={<Get_your_map />} />
      <Route path="/Weather" element={<Weather />} />
      <Route path="/Dashboard" element={<Dashboard />} />
      <Route path="/Crop_disease" element={<Crop_disease />} />
      <Route path="/Nearby_market" element={<Nearby_market />} />
    </Routes>
  </BrowserRouter>
)
