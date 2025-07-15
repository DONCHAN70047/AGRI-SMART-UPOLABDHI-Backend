
// CREATE AND ADD AGROMONITORING API KEY TO THE ENVIRONMENT VARIABLES (AGRO_API)

// Create a new Polygon
export async function create_polygon({ coordinates_array, polygon_name }) {
    const responce = await fetch(`http://api.agromonitoring.com/agro/1.0/polygons?appid=${process.env.AGRO_API}`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: {
            "name": polygon_name,
            "geo_json": {
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [coordinates_array]
                }
            }
        }
    })

    const result = await responce.json()
    return { responce, result }
}

// Create a duplicate Polygon
export async function create_duplicate_polygon({ coordinates_array, polygon_name }) {
    const responce = await fetch(`http://api.agromonitoring.com/agro/1.0/polygons?appid=${process.env.AGRO_API}&duplicated=true`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: {
            "name": polygon_name,
            "geo_json": {
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [coordinates_array]
                }
            }
        }
    })

    const result = await responce.json()
    return { responce, result }
}

// get specific polygon info
export async function get_polygon_info({ poly_id }) {
    const responce = await fetch(`http://api.agromonitoring.com/agro/1.0/polygons/${poly_id}?appid=${process.env.AGRO_API}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })

    const result = await responce.json()
    return { responce, result }
}

// get the list of polygons
export async function get_list_of_polygons() {
    const responce = await fetch(`http://api.agromonitoring.com/agro/1.0/polygons?appid=${process.env.AGRO_API}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })

    const result = await responce.json()
    return { responce, result }
}

//delete a particular polygon
export async function delete_polygon({ poly_id }) {
    const responce = await fetch(`http://api.agromonitoring.com/agro/1.0/polygons/${poly_id}?appid=${process.env.AGRO_API}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })

    const result = await responce.json()
    return { responce, result }
}