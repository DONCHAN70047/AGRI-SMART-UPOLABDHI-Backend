
export async function get_soil_data({ poly_id }) {
    const responce = await fetch(`http://api.agromonitoring.com/agro/1.0/soil?polyid=${poly_id}&appid=${process.env.VITE_BACKEND_URL}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
        }
    })
    const result = await responce.json()
    return { responce, result }
}

export async function get_UVI_data({ poly_id }) {
    const responce = await fetch(`http://api.agromonitoring.com/agro/1.0/uvi?polyid=${poly_id}&appid=${process.env.VITE_BACKEND_URL}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
        }
    })
    const result = await responce.json()
    return { responce, result }
}