import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    email: '',
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async () => {
    if (!formData.name || !formData.password || !formData.email) {
      return alert('📝 Please fill in all fields');
    }

    setLoading(true);

    try {
      const payload = {
        username: formData.name, 
        password: formData.password,
        email: formData.email,
      };

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/sign_in/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: formData.name,
          password: formData.password,
          email: formData.email,
          }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Signup failed');

      console.log('✅ Signup Success:', data);
      alert('🎉 Account created successfully!');
      navigate('/login');
    } catch (err) {
      console.error('❌ Signup error:', err.message);
      alert('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <img
        src="/Get_your_map_bg.png"
        alt="background"
        className="absolute w-full h-full object-cover -z-50"
      />

      {/* Signup Form */}
      <main className="pt-[100px] px-6 min-h-[calc(100vh-100px)] flex items-center justify-center">
        <div className="w-full max-w-md bg-white/30 backdrop-blur-md p-8 rounded-2xl shadow-2xl border-2 border-white">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">📝 Sign Up</h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSignup();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm text-gray-700">Username</label>
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

            <button
              type="submit"
              className="w-full py-2 mt-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

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
