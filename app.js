console.log("app.js loaded successfully");

// Check that the map container exists
var mapContainer = document.getElementById('map');
if (!mapContainer) {
    console.error("No element with id 'map' found. Ensure your index.html contains a <div id='map'>.");
}

// Define the default street (OSM) tile layer.
var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
});

// Define a satellite tile layer using Esri World Imagery.
var satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 22,
    attribution: 'Tiles © Esri'
});

// Initialize the Leaflet map with a given center and zoom level.
var map = L.map('map', {
    center: [3.0, 101.0],
    zoom: 8,
    layers: [osm] // Set the default layer
});
console.log("Leaflet map initialized.");

// Expose the map as a global variable so it can be accessed when margins are applied.
window.map = map;

// Add a layer control to allow users to switch between the base layers.
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

    // Create a JSON message with the coordinate data.
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

/*
 * This function is intended to be called by Unity via external messaging.
 * It receives a JSON string containing the margins (left, right, top, bottom)
 * for the map frame. Once received, it applies these margins to the #map element,
 * so that the Leaflet map scales correctly within the frame.
 */
function ReceiveMargins(jsonData) {
    console.log("ReceiveMargins called with data:", jsonData);
    try {
        var margins = JSON.parse(jsonData);
        console.log("Parsed margins:", margins);
        
        var mapContainer = document.getElementById('map');
        if (!mapContainer) {
            console.error("Map container not found when applying margins.");
            return;
        }
        // Update the CSS margins of the map container. The values are assumed to be in pixels.
        mapContainer.style.marginLeft = margins.left + "px";
        mapContainer.style.marginRight = margins.right + "px";
        mapContainer.style.marginTop = margins.top + "px";
        mapContainer.style.marginBottom = margins.bottom + "px";
        console.log("Updated map container margins.");

        // Notify the map to recalculate its size if necessary.
        if (window.map && typeof window.map.invalidateSize === 'function') {
            window.map.invalidateSize();
            console.log("Map size invalidated.");
        }
    } catch (e) {
        console.error("Error parsing or applying margin data:", e);
    }
}
