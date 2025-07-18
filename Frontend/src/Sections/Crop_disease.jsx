import React, { useState } from 'react';
import Navbar from '../Components/Navbar';

const Detection = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
  };

  const handleDetect = async () => {
  if (!image) return alert('📷 Please upload or capture a photo first');

  setLoading(true);

  try {
    const formData = new FormData();
    formData.append('image', image);  // field name must match backend

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/detect/`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Detection failed');
    setResult(data);
  } catch (err) {
    console.error('Detection failed', err);
    alert('❌ ' + err.message);
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="relative min-h-screen">
        <Navbar />
        
      {/* 🔲 Full Page Background */}
      <img
        src="/Get_your_map_bg.png"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover -z-50"
      />


      {/* 🧊 Blurred Container */}
      <div className="min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl bg-white/30 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white space-y-6">
          <h2 className="text-3xl font-bold text-center text-gray-800">🌿 Disease Detection</h2>
          <p className="text-center text-gray-700">
            Upload or capture a plant image to detect any disease.
          </p>

          {/* Upload Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <label className="cursor-pointer bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-xl shadow-md text-sm">
              📁 Upload from Device
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <label className="cursor-pointer bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-xl shadow-md text-sm">
              📸 Take a Photo
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Image Preview */}
          {previewUrl && (
            <div className="flex justify-center">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-64 h-64 object-cover rounded-xl border shadow-md"
              />
            </div>
          )}

          {/* Detect Button */}
          <div className="text-center">
            <button
              onClick={handleDetect}
              disabled={loading}
              className="mt-4 bg-green-700 hover:bg-green-800 text-white py-2 px-6 rounded-xl shadow font-semibold transition"
            >
              {loading ? '🔍 Detecting...' : '🧪 Detect Disease'}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="mt-6 bg-white/60 p-4 rounded-xl text-gray-900 shadow-inner space-y-3">
              <h3 className="text-xl font-bold">🦠 Disease: {result.disease}</h3>
              <div className="max-h-48 overflow-y-auto mt-2 space-y-2 pr-2 scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-white/30">
                <h4 className="text-md font-semibold text-gray-700">💡 Suggestions:</h4>
                {result.suggestion?.map((tip, index) => (
                  <div key={index} className="bg-green-100 text-green-800 p-2 rounded-md text-sm shadow">
                    ✅ {tip}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Detection;
