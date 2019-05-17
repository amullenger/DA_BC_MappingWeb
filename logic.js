// Store URL for JSON data describing 4.5+ magnitude earthquakes in last 30 days
var earthquakeURL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson'

// Request data from earthquakeURL
d3.json(earthquakeURL, function(data) {
    // Send data to createFeatures function
    createFeatures(data.features);
});


// Define createFeatures function used above
function createFeatures(quakeData){

    // Define function for binding popups for each feature to the qake data layer
    function onEachFeature(feature, layer){
        layer.bindPopup('<h2>' + feature.properties.place + 
        '</h2><hr><p>' + 'Magnitude: ' + feature.properties.mag + '</p>');
    };
    
    // Define geoJSON layer for all quake JSON data.
    // Use pointToLayer option to create circles with sizes based on magnitude
    // Alter fillColor based on quake magnitude
    var quakes = L.geoJSON(quakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            
            var circleColor

            if (feature.properties.mag <= 5.0) {
                circleColor = 'lightsalmon';
            } else if (feature.properties.mag <= 5.9) {
                circleColor = 'indianred';
            } else {
                circleColor = 'darkred';
            };
            
            var markerOptions = {
                stroke: false,
                fillOpacity: 0.8,
                color: 'white', 
                fillColor: circleColor, 
                radius: feature.properties.mag*1.5
            };
            return L.circleMarker(latlng, markerOptions);
        }
    });
    
    // Define geoJSON layer for filtered data. Use consistent coloring for circles
    var bigQuakes = L.geoJSON(quakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function(feature, latlng) {
            if(feature.properties.mag >= 6.0){
                var markerOptions = {
                    stroke: false,
                    fillOpacity: 0.8,
                    color: 'white',
                    fillColor: 'darkred',
                    radius: feature.properties.mag*1.5
                };
                return L.circleMarker(latlng, markerOptions);
            };
        }
    })

    // Call createMap function, passing in both geoJSON layers created above
    createMap(quakes, bigQuakes);
};

// Define createMap function which defines base layers and generates the map
function createMap(quakes, bigQuakes) {

    // Create light and dark layers
    var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.dark",
        accessToken: API_KEY
    });

    var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
    });

    // Define baseMaps variable to store light and dark maps
    var baseMaps = {
        'Dark Map': darkmap,
        'Light Map': lightmap
    };

    // Define overlayMaps variable to store both geoJSON layers
    var overlayMaps = {
        'Month-to-date earthquakes (4.5+)': quakes,
        'Month-to-date earthquakes (6.0+)': bigQuakes
    };

    // Create map with default layers. Center around Libya and zoom out to increase visibility
    var myMap = L.map("map", {
        center: [
          26.3, 17.2
        ],
        zoom: 3,
        layers: [darkmap, quakes]
    });

    // Create controls for various layers
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

};
