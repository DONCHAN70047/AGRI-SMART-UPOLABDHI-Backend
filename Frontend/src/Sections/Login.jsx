import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext)

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault(); // prevent form reload

    if (!formData.username || !formData.password) {
      return alert('📝 Please fill in all fields');
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/log_in/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Login failed');

      console.log('✅ Login Success:', data);
      setUser({ name: data.username })
      alert('🎉 Logged in successfully!');
      navigate('/Get_your_map');
    } catch (err) {
      console.error('❌ Login error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* ✅ Top-Right Buttons */}
      <div className="absolute top-6 right-6 flex gap-3 z-10">
        <Link to="/Dashboard" className="bg-green-600 text-white px-4 py-2 rounded-xl shadow-md hover:bg-green-700 transition">
          Go to Dashboard
        </Link>
        <Link to="/Get_your_map" className="bg-green-600 text-white px-4 py-2 rounded-xl shadow-md hover:bg-green-700 transition">
          Pin Your Location
        </Link>
      </div>

      {/* Background */}
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

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm text-gray-700">Username</label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 text-gray-800 shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
              />
            </div>

            {/* Password */}
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 mt-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
            >
              {loading ? 'Logging in...' : 'Log In'}
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
