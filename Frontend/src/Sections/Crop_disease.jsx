import React, { useContext, useState } from 'react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { Route } from 'react-router';
import { UserContext } from '../context/UserContext';

const Detection = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [crop, setCrop] = useState("potato");
  const [disease, setDisease] = useState("late blight");

  const {user, setUser} = useContext(UserContext)

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
  };

  const handleDetect = async () => {
    // if (!image) return alert('📷 Please upload or capture a photo first');

    // setLoading(true);

    // try {
    //   const formData = new FormData();
    //   formData.append('image', image);

    //   const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/detect/`, {
    //     method: 'POST',
    //     body: formData,
    //   });

    //   const data = await response.json();
    //   if (!response.ok) throw new Error(data.error || 'Detection failed');
    //   setResult(data);
    // } catch (err) {
    //   console.error('Detection failed', err);
    //   alert('❌ ' + err.message);
    // } finally {
    //   setLoading(false);
    // }

    console.log(crop, disease)
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/get_disease_details/`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({user_id: user, crop_name: crop, crop_disease: disease}),
    })
    const result = await response.json()
    const data = JSON.parse(result.replace(/```json|```/g, ""))
    console.log(data)
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
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/30 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white">

          {/* 🔽 Left Card – Upload Section */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-center text-gray-800">🌿 Disease Detection</h2>
            <p className="text-center text-gray-700">
              Upload or capture a plant image to detect any disease.
            </p>

            {/* Inputs  */}
            <div>
              <div>
                <select
                  name="crop_name"
                  id="crop-select"
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="border rounded-md px-4 py-2 w-full"
                >
                  <option value="potato">Potato</option>
                  <option value="carrot">Carrot</option>
                  <option value="tomato">Tomato</option>
                </select>
              </div>
              <div>
                <select
                  name="disease_name"
                  id="disease-select"
                  value={disease}
                  onChange={(e) => setDisease(e.target.value)}
                  className="border rounded-md px-4 py-2 w-full"
                >
                  <option value="late blight">Late Blight</option>
                  <option value="alternaria leaf blight">Alternaria Leaf Blight</option>
                  <option value="early blight">Early Blight</option>
                </select>
              </div>
            </div>

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
          </div>

          {/* 🔽 Right Card – Result Section */}
          <div className="bg-white/60 p-6 rounded-xl shadow-inner text-gray-900 flex flex-col justify-center">
            {result ? (
              <>
                <h3 className="text-xl font-bold mb-4">🦠 Disease: {result.disease}</h3>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-white/30">
                  <h4 className="text-md font-semibold text-gray-700">💡 Suggestions:</h4>
                  {result.suggestion?.map((tip, index) => (
                    <div key={index} className="bg-green-100 text-green-800 p-2 rounded-md text-sm shadow">
                      ✅ {tip}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500 italic">🤖 Prediction output will appear here...</p>
            )}
          </div>

        </div>
      </div>
      <Footer />
    </div>

  );
};

export default Detection;
