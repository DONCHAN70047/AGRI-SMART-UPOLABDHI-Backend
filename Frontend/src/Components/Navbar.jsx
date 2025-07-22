import React, { useContext, useState, useEffect, useCallback } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import Sign_out from './Sign_out';
import { get_current_user } from './Functions';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Declare current user
  const { user, setUser } = useContext(UserContext)
  const location = useLocation()

  const fetchUser = useCallback(async () => {
    try {
      const data = await get_current_user();
      setUser(data);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  console.log(user)

  return (
    <nav className="w-[95%] fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-black/30 backdrop-blur-md border border-zinc-800 shadow-md rounded-2xl">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3 md:px-6">

        {/* Logo */}
        <NavLink to="/">
          <img
            src="/logo.png"
            alt="website logo"
            className="h-10 w-10 object-contain border border-white rounded-lg bg-white/20 p-1"
          />
        </NavLink>

        {/* Desktop Nav Links - Button/Box Style */}
        <div className="hidden md:flex items-center relative">
          <ul className="flex items-center gap-4">
            {["Home", "Get your Map", "Weather", "Dashboard", "Crop Disease", "Nearby Market"].map((item, index) => (
              <li key={index}>
                <NavLink
                  to={`/${item.charAt(0).toUpperCase() + item.slice(1).toLowerCase().replace(/ /g, '_')}`}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-xl font-semibold transition 
                    ${isActive ? 'bg-yellow-500 text-white' : 'bg-white/10 text-white hover:bg-yellow-400 hover:text-yellow-900'} 
                    shadow border border-yellow-400`
                  }
                >
                  {item}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Desktop Auth Buttons */}
        {user ? (
          <div><Sign_out /></div>
        ) : (
          <div className="hidden md:flex gap-3">
            <Link to="/login">
              <button className="px-4 py-2 text-white border border-white rounded-xl transition hover:bg-white hover:text-yellow-700 hover:scale-105">
                Log in...
              </button>
            </Link>

            <Link to="/signup">
              <button className="px-4 py-2 bg-yellow-500 text-white rounded-xl transition hover:bg-yellow-600 hover:scale-105">
                Sign up...
              </button>
            </Link>
          </div>
        )}

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
        <div className="md:hidden bg-black/30 backdrop-blur-md px-6 pb-4 pt-2 rounded-b-2xl shadow-lg">
          <ul className="flex flex-col gap-4 text-white font-medium">
            {["Home", "Get your Map", "Weather", "Dashboard", "Crop Disease", "Nearby Market"].map((item, index) => (
              <li key={index}>
                <NavLink
                  to={`/${item.charAt(0).toUpperCase() + item.slice(1).toLowerCase().replace(/ /g, '_')}`}
                  className={`block text-center hover:text-yellow-400 transition ${location.pathname === `/${item.charAt(0).toUpperCase() + item.slice(1).toLowerCase().replace(/ /g, '_')}` ? 'text-yellow-500' : 'text-white'}`}
                  onClick={() => setIsOpen(false)}
                >
                  {item}
                </NavLink>
              </li>
            ))}
          </ul>

          {user ? (
            <div><Sign_out /></div>
          ) : (
            <div className="flex flex-col gap-3 mt-4">
              <Link to="/login">
                <button className="px-4 py-2 text-white border border-white rounded-xl transition hover:bg-white hover:text-yellow-700" onClick={() => setIsOpen(false)}>
                  Log in
                </button>
              </Link>

              <Link to="/signup">
                <button className="px-4 py-2 bg-yellow-500 text-white rounded-xl transition hover:bg-yellow-600">
                  Sign up
                </button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
