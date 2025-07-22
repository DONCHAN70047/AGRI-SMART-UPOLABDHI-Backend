import React from 'react'
import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer';

const Nearby_market = () => {
    return (
        <div>
            <Navbar />
            <img
                src="/clear.jpg"
                alt="background_img"
                className="absolute w-full h-full object-cover -z-50"
            />

            <div className='pt-30 px-10'>
                hello, you are in Nearby_market
            </div>
            <Footer />
        </div>
    )
}

export default Nearby_market
