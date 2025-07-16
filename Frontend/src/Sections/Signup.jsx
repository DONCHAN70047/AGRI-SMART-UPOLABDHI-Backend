import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Signup successful:', result);
      navigate('/login');
    } else {
      console.error('❌ Signup failed:', result.message || result.error);
    }
  } catch (error) {
    console.error('❌ Network or server error:', error);
  }
};


  return (
    <div className="relative min-h-screen">

      {/* Background Image */}
      <img
        src="/Get_your_map_bg.png"
        alt="background"
        className="absolute w-full h-full object-cover -z-50"
      />

      {/* Signup Form */}
      <main className="pt-[100px] px-6 min-h-[calc(100vh-100px)] flex items-center justify-center">
        <div className="w-full max-w-md bg-white/30 backdrop-blur-md p-8 rounded-2xl shadow-2xl border-2 border-white">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">📝 Sign Up</h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm text-gray-700">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 text-gray-800 shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 text-gray-800 shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 text-gray-800 shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700">Phone Number</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 text-gray-800 shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 mt-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
            >
              Create Account
            </button>
          </form>
            



          {/* 🔁 Login link */}
          <div className="text-center mt-6 text-sm text-gray-800">
            Already have an account?{' '}
            <Link to="/login" className="text-green-700 hover:underline font-semibold">
              Log in here
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Signup;
