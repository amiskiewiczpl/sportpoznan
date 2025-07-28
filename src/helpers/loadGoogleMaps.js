let googleMapsPromise;

export const loadGoogleMaps = () => {
  if (!googleMapsPromise) {
    googleMapsPromise = new Promise((resolve, reject) => {
      if (typeof window.google === 'object' && typeof window.google.maps === 'object') {
        resolve(window.google);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.google);
      script.onerror = (err) => reject(err);
      document.head.appendChild(script);
    });
  }

  return googleMapsPromise;
};
