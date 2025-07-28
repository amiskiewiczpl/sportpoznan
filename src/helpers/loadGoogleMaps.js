// helpers/loadGoogleMaps.js
export const loadGoogleMaps = () => {
  return new Promise((resolve, reject) => {
    if (typeof window.google === "object" && typeof window.google.maps === "object") {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => resolve();
    script.onerror = () => reject("Nie udało się załadować Google Maps");

    document.head.appendChild(script);
  });
};
