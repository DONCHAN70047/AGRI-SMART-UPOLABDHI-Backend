// PAGE - CROP DISEASES ===================================================================================

export const get_disease_details = async (body) => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/get_disease_details/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    })
    const result = await response.json()
    return { response, result };
};

export const upload_disease_details = async (body) => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/upload_disease_details/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    const result = await response.json();
    return { response, result };
};

export const handle_image = async (body) => {
    const response = await fetch("http://localhost:8000/api/handle_image/", {
        method: "POST",
        body: body,
    });

    const result = await response.json();
    return { response, result }
}
