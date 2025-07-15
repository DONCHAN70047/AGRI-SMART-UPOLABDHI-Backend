export async function get_lat_lon() {
  if (!("geolocation" in navigator)) {
    throw new Error("Geolocation is not supported by this browser.");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject("Location access denied by the user.");
            break;
          case error.POSITION_UNAVAILABLE:
            reject("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            reject("The request to get user location timed out.");
            break;
          default:
            reject("An unknown error occurred.");
        }
      }
    );
  });
}
