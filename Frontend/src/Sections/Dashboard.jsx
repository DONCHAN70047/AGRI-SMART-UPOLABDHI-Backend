import React from 'react'
import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer';

const Dashboard = () => {
    return (
        <div>
            <Navbar />
            <img
                src="/clear.jpg"
                alt="background_img"
                className="absolute w-full h-full object-cover -z-50"
            />

            <div className='pt-30 px-10'>
                hello, you are in Dashboard
            </div>
            <Footer />
        </div>
    )
}

export default Dashboard
