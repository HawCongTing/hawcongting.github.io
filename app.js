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
var nextMarkerId = 0;

// on click, create marker with a unique ID and send that ID to Unity
map.on('click', function(e) {
  console.log("Map clicked:", e.latlng);
  var m = L.marker(e.latlng).addTo(map).bindPopup("Waypoint").openPopup();
  m._customId = ++nextMarkerId;
  markers.push(m);

  var msg = JSON.stringify({
    method: "mapClick",
    id: m._customId,
    lat: e.latlng.lat,
    lng: e.latlng.lng
  });

  if (window.Unity && Unity.call) {
    Unity.call(msg);
    console.log("→ Sent to Unity:", msg);
  }
});

// new: remove by ID, not by float matching
window.removeMarkerById = function(id) {
  console.log("removeMarkerById called with", id);
  for (let i = markers.length - 1; i >= 0; i--) {
    if (markers[i]._customId === id) {
      map.removeLayer(markers[i]);
      markers.splice(i, 1);
      console.log("→ Removed marker ID", id);
      if (window.Unity && Unity.call) {
        Unity.call(JSON.stringify({
          method: "markerRemoved",
          id: id
        }));
      }
      return;
    }
  }
  console.warn("→ No marker found with ID", id);
};

// handshake so Unity knows JS loaded
window.addEventListener('load', function() {
  if (window.Unity && Unity.call) {
    Unity.call(JSON.stringify({ method: "jsReady" }));
    console.log("→ Sent jsReady to Unity");
  }
});
