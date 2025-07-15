import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const location = useLocation()

  return (
    <nav className="w-[95%] fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-white/10 backdrop-blur-md border-b border-white shadow-md rounded-2xl">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3 md:px-6">

        {/* Logo */}
        <NavLink to="/">
          <img
            src="/logo.png"
            alt="website logo"
            className="h-10 w-10 object-contain border border-white rounded-lg bg-white/20 p-1"
          />
        </NavLink>

        {/* Desktop Nav Links */}
        <ul className="hidden md:flex items-center gap-6 text-white font-medium">
          {["Home", "Get your Map", "Weather", "Dashboard", "Crop Disease", "Nearby Market"].map((item, index) => (
            <li key={index}>
              <NavLink
                to={`/${item.charAt(0).toUpperCase() + item.slice(1).toLowerCase().replace(/ /g, '_')}`}
                className={`relative transition-all duration-200 ease-in-out hover:-translate-y-1 hover:text-green-400 after:absolute after:left-0 after:bottom-0 after:h-[3px] after:w-full after:rounded-full after:bg-green-500 after:opacity-0 hover:after:opacity-100 ${location.pathname === `/${item.charAt(0).toUpperCase() + item.slice(1).toLowerCase().replace(/ /g, '_')}` ? 'text-green-600' : 'text-white'}`}
              >
                {item}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex gap-3">
          <button className="px-4 py-2 text-white border border-white rounded-xl transition hover:bg-white hover:text-green-700 hover:scale-105">
            Log in
          </button>
          <button className="px-4 py-2 bg-green-500 text-white rounded-xl transition hover:bg-green-600 hover:scale-105">
            Sign up
          </button>
        </div>

        {/* Hamburger */}
        <button className="md:hidden text-white focus:outline-none" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white/10 backdrop-blur-md px-6 pb-4 pt-2 rounded-b-2xl shadow-lg">
          <ul className="flex flex-col gap-4 text-white font-medium">
            {["Home", "Get your Map", "Weather", "Dashboard", "Crop Disease", "Nearby Market"].map((item, index) => (
              <li key={index}>
                <NavLink
                  to={`/${item.charAt(0).toUpperCase() + item.slice(1).toLowerCase().replace(/ /g, '_')}`}
                  className={`block text-center hover:text-green-400 transition ${location.pathname === `/${item.charAt(0).toUpperCase() + item.slice(1).toLowerCase().replace(/ /g, '_')}` ? 'text-green-600' : 'text-white'}`}
                  onClick={() => setIsOpen(false)}
                >
                  {item}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 mt-4">
            <button className="px-4 py-2 text-white border border-white rounded-xl transition hover:bg-white hover:text-green-700">
              Log in
            </button>
            <button className="px-4 py-2 bg-green-500 text-white rounded-xl transition hover:bg-green-600">
              Sign up
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
