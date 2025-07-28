// src/utils/loadGoogleMaps.js

export function loadGoogleMaps(apiKey) {
  // Sprawdź, czy skrypt już jest – żeby nie ładować kilka razy
  if (document.getElementById("google-maps-script")) return;

  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  script.async = true;
  script.defer = true;
  script.id = "google-maps-script";
  document.body.appendChild(script);
}
