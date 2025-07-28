// helpers/loadGoogleMaps.js
let loaded = false;

export function loadGoogleMaps() {
  if (loaded) return Promise.resolve();

  return new Promise((resolve, reject) => {
    if (typeof window.google === "object" && typeof window.google.maps === "object") {
      loaded = true;
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      loaded = true;
      resolve();
    };

    script.onerror = (err) => reject(err);

    document.head.appendChild(script);
  });
}
