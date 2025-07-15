import { NavLink } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <main className="relative w-full h-screen overflow-hidden text-white font-sans">
      {/* Background Image */}
      <img
        src="/clear.jpg"
        alt="background_img"
        className="absolute w-full h-full object-cover -z-50"
      />

      {/* Light Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-green-900/20 to-transparent -z-40" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between h-full px-4 sm:px-6 md:px-16 py-6 sm:py-10">
        {/* Left Section – Farmer Image */}
        <div className="flex justify-center items-center w-full md:w-1/2 mb-8 md:mb-0">
          <img
            src="/Farmer_2.png"
            alt="farmer_image"
            className="h-72 sm:h-96 md:h-[35rem] w-auto drop-shadow-2xl"
          />
        </div>

        {/* Right Section – Hero Text */}
        <div className="w-full md:w-1/2 text-center md:text-left space-y-4 sm:space-y-6">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold drop-shadow-lg leading-tight">
            Smart Farming<br className="hidden md:block" />
            <span className="text-lime-400">Assistant</span>
          </h1>

          <p className="text-base sm:text-lg lg:text-2xl max-w-xl mx-auto md:mx-0 text-white/90 px-2 sm:px-0">
            Grow smarter, not harder. Leverage AI & data to make farming easier, greener, and more profitable.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 sm:mt-6 justify-center md:justify-start px-2 sm:px-0">
            <NavLink
              to="/Get_your_map"
              className="px-6 py-3 w-64 text-center bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-600 hover:to-lime-600 rounded-full text-base sm:text-lg font-bold shadow-xl transition duration-300"
            >
              🌿 Get Started
            </NavLink>
            <NavLink
              to="/login"
              className="px-6 py-3 w-64 text-center bg-white text-green-800 hover:bg-gray-100 rounded-full text-base sm:text-lg font-bold shadow-md transition duration-300"
            >
              🔑 Login to Dashboard
            </NavLink>
          </div>
        </div>
      </div>
    </main>
  )
}

export default App
