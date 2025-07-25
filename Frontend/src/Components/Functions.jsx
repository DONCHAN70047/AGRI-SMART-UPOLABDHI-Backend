const access_token = sessionStorage.getItem('access_token')
const refresh_token = sessionStorage.getItem('refresh_token')

export async function fetch_verified_user() {
    const verify_responce = await fetch(`${import.meta.env.VITE_BACKEND_URL}/verify/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "token": access_token }),
    })

    const verify_result = await verify_responce.json()

    if (verify_result?.code === "token_not_valid") {
        const refresh_response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "refresh": refresh_token }),
        })

        const refresh_result = await refresh_response.json()

        sessionStorage.setItem('access_token', refresh_result.access)
    }

    return ({
        "access": sessionStorage.getItem('access_token'),
        "refresh": sessionStorage.getItem('refresh_token')
    })
}

export async function get_current_user() {
    const { access, refresh } = await fetch_verified_user()

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/current_user/`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${access}`,
            "Content-Type": "application/json"
        }
    })

    if (response.ok) {
        const data = await response.json();
        // return ({"id": data.id, "username": data.username})
        return data
    } else {
        console.error("Unauthorized or error:", response.status);
    }
}

export const getWeatherStatus = ({ min, max, humidity, rain }) => {
  const avg = (min + max) / 2;

  if (rain > 0 && humidity > 65 && avg > 25) return "Monsoon";
  if (rain > 0) return "Rainy";
  if (avg <= 10) return "Freezing";
  if (avg <= 18) return "Cold";
  if (avg <= 25) return "Pleasant";
  if (avg <= 30) return "Warm";
  if (avg <= 35) return "Hot";
  if (avg <= 40) return "Very Hot";
  return "Scorching";
};
