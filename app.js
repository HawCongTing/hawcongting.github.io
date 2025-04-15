// File: app.js

// Initialize the Leaflet map with an appropriate center and zoom level.
var map = L.map('map').setView([3.0, 101.0], 8); // Adjust as needed

// Add OpenStreetMap tile layer.
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

// Array to keep track of markers for visual feedback.
var markers = [];

// Listen for map clicks.
map.on('click', function(e) {
  console.log("Map clicked at:", e.latlng);

  // Add a marker as visual feedback.
  var marker = L.marker(e.latlng).addTo(map);
  marker.bindPopup("Waypoint").openPopup();
  markers.push(marker);

  // Create a JSON string with the coordinate data.
  var messageObj = {
    method: "mapClick",
    lat: e.latlng.lat,
    lng: e.latlng.lng
  };
  var message = JSON.stringify(messageObj);

  // Send the message to Unity using Keijiro's WebViewObject.
  if (window.Unity && window.Unity.call) {
    window.Unity.call(message);
    console.log("Sent message to Unity:", message);
  } else {
    console.error("window.Unity.call is not available. Ensure the page is loaded inside Unity's WebView.");
  }
});
