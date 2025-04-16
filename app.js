// app.js

console.log("app.js loaded successfully");

// Check that the map container exists
var mapContainer = document.getElementById('map');
if (!mapContainer) {
    console.error("No element with id 'map' found. Ensure your index.html contains a <div id='map'>.");
}

// Define the default (street) tile layer.
var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,  // Maximum zoom level for OSM
    attribution: '© OpenStreetMap'
});

// Define a satellite tile layer using Esri World Imagery.
var satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 22,  // Higher maximum zoom level for satellite imagery
    attribution: 'Tiles © Esri'
});

// Initialize the Leaflet map with the desired center and zoom level.
// Here, we add the default osm layer. You can change it to satellite if desired.
var map = L.map('map', {
    center: [3.0, 101.0],
    zoom: 8,
    layers: [osm]  // Default layer
});
console.log("Leaflet map initialized.");

// Add base layers control so that the user can switch between street and satellite views.
var baseLayers = {
    "Street Map": osm,
    "Satellite": satellite
};
L.control.layers(baseLayers).addTo(map);
console.log("Layer control added to the map.");

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
    
    // Send the message to Unity using Keijiro's WebViewObject if available.
    if (window.Unity && window.Unity.call) {
        window.Unity.call(message);
        console.log("Sent message to Unity:", message);
    } else {
        console.warn("window.Unity.call is not available. Ensure the page is loaded inside Unity's WebView if using Unity integration.");
    }
});

console.log("Map and layers are fully configured.");
