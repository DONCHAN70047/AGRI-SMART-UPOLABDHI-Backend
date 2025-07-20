import React from 'react';
import { useNavigate } from 'react-router';

const Sign_out = () => {

    const navigate = useNavigate()

    const handleSignOut = async () => {
        const responce = await fetch(`${import.meta.env.VITE_BACKEND_URL}/blacklist/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        })
        const result = await responce.json()
        console.log(result);
        navigate('/')
        return { responce, result }
    };

    return (
        <div className="flex justify-center items-center">
            <button
                onClick={handleSignOut}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md transition duration-200"
            >
                Sign Out
            </button>
        </div>
    );
};

export default Sign_out;
