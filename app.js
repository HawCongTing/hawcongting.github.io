// app.js

console.log("app.js loaded successfully");

var mapEl = document.getElementById('map');
if (!mapEl) console.error("No #map element found!");

var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap'
});
var satellite = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  { maxZoom: 22, attribution: 'Tiles © Esri' }
);

var map = L.map('map', {
  center: [3.0, 101.0],
  zoom: 8,
  layers: [osm]
});
console.log("Leaflet map initialized.");

L.control.layers({ "Street": osm, "Satellite": satellite }).addTo(map);
console.log("Layer switcher added.");

var markers = [];

map.on('click', function(e) {
  console.log("Map clicked:", e.latlng);
  var m = L.marker(e.latlng).addTo(map).bindPopup("Waypoint").openPopup();
  markers.push(m);

  var msg = JSON.stringify({ method: "mapClick", lat: e.latlng.lat, lng: e.latlng.lng });
  if (window.Unity && Unity.call) {
    Unity.call(msg);
    console.log("→ Sent to Unity:", msg);
  } else {
    console.warn("Unity.call() not available. Running outside WebView?");
  }
});

// allow Unity to tell us to remove a marker
window.removeMarkerByLatLng = function(lat, lng) {
  console.log("removeMarkerByLatLng called with", lat, lng);
  for (let i = markers.length - 1; i >= 0; i--) {
    const m = markers[i];
    const ll = m.getLatLng();
    if (Math.abs(ll.lat - lat) < 1e-6 && Math.abs(ll.lng - lng) < 1e-6) {
      map.removeLayer(m);
      markers.splice(i, 1);
      console.log("→ Removed marker at", lat, lng);
      if (window.Unity && Unity.call) {
        Unity.call(JSON.stringify({
          method: "markerRemoved",
          lat: lat,
          lng: lng
        }));
      }
      break;
    }
  }
};
