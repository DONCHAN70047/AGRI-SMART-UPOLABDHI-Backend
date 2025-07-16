import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        const token = localStorage.getItem('token');
        const protectedRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/protected`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        });

        const protectedData = await protectedRes.json();
        console.log('Protected data:', protectedData);

        navigate('/Dashboard');
        } else {
            setError(data.error || 'Login failed');
        }
        } catch (err) {
            console.error('Login error:', err);
            setError(' Something went wrong. Please try again later.');
        }
    };

  return (
    <div className="relative min-h-screen">

      {/* ✅ Top-Right Buttons Container */}
      <div className="absolute top-6 right-6 flex gap-3 z-10">
        <Link
          to="/Dashboard"
          className="bg-green-600 text-white px-4 py-2 rounded-xl shadow-md hover:bg-green-700 transition"
        >
          Go to Dashboard
        </Link>
        <Link
          to="/Get_your_map"
          className="bg-green-600 text-white px-4 py-2 rounded-xl shadow-md hover:bg-green-700 transition"
        >
          Pin Your Location
        </Link>
      </div>

      {/* Background Image */}
      <img
        src="/Get_your_map_bg.png"
        alt="background"
        className="absolute w-full h-full object-cover -z-50"
      />

      <main className="pt-[100px] px-6 min-h-[calc(100vh-100px)] flex items-center justify-center">
        <div className="w-full max-w-md bg-white/30 backdrop-blur-md p-8 rounded-2xl shadow-2xl border-2 border-white">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">🔐 Log In</h2>

          {error && (
            <div className="text-red-600 text-center mb-4 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 text-gray-800 shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 text-gray-800 shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 mt-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
            >
              Log In
            </button>
          </form>

          {/* Sign Up Suggestion */}
          <div className="text-center mt-6 text-sm text-gray-800">
            Don’t have an account?{' '}
            <Link to="/signup" className="text-green-700 hover:underline font-semibold">
              Sign up here
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
