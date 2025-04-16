// app.js

// Log to verify the script loaded
console.log("app.js loaded successfully");

// Check that the map container exists
var mapContainer = document.getElementById('map');
if (!mapContainer) {
    console.error("No element with id 'map' found. Ensure your index.html contains a <div id='map'>.");
}

// Initialize the Leaflet map with the desired center and zoom level.
var map = L.map('map').setView([3.0, 101.0], 8);
console.log("Leaflet map initialized.");

// Add the OpenStreetMap tile layer.
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);
console.log("Tile layer added to the map.");

// Array to keep track of markers for visual feedback.
var markers = [];

// Listen for map clicks.
map.on('click', function(e) {
    console.log("Map clicked at:", e.latlng);

    // Add a marker as visual feedback.
    var marker = L.marker(e.latlng).addTo(map);
    marker.bindPopup("Waypoint").openPopup();
    markers.push(marker);

    // Prepare a JSON message with the coordinate data.
    var messageObj = {
        method: "mapClick",
        lat: e.latlng.lat,
        lng: e.latlng.lng
    };
    var message = JSON.stringify(messageObj);
    
    // Send the message to Unity using Keijiro's WebViewObject if available.
    if (window.Unity && window.Unity.call) {
        window.Unity.call(message);
        console.log("Sent message to Unity:", message);
    } else {
        // If not loaded within Unity's WebView, log a warning instead.
        console.warn("window.Unity.call is not available. Ensure the page is loaded inside Unity's WebView if using Unity integration.");
    }
});
