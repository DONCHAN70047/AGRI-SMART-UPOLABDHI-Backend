import React from 'react'
import Navbar from '../Components/Navbar'

const Crop_disease = () => {
    return (
        <div>
            <Navbar />
            <img
                src="/clear.jpg"
                alt="background_img"
                className="absolute w-full h-full object-cover -z-50"
            />

            <div className='pt-30 px-10'>
                hello, you are in Crop_disease
            </div>
        </div>
    )
}

export default Crop_disease
