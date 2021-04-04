var earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tectonicUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform a GET request to the query URL
d3.json(earthquakeUrl, function (data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
});

// d3.json(tectonicUrl, function (data) {
//     // Once we get a response, send the data.features object to the createFeatures function
//     createTectonics(data.features);
// });

// function createTectonics(tectonicData) {
//     var faultLines = Array();

//     for (var i = 0; i < tectonicData.length; i++) {
//         faultLines.push(tectonicData[i].geometry.coordinates);
//     };

//     console.log(faultLines);

//     var tectonics = L.polyline(faultLines, { color: "orange" })

//     createMap(tectonics);
// };

// Create Earthquake data for mapping
function createFeatures(earthquakeData) {
    d3.json(tectonicUrl, function (jsonPromise) {
        // Loop through the magnitude array and assign a colour
        function earthquakeColour(data) {

            // Conditionals for magnitude
            if (data < 1.0) {
                color = "#b7f24c";
            }
            else if ((data >= 1.0) && (data < 2.0)) {
                color = "#e0f24d";
            }
            else if ((data >= 2.0) && (data < 3.0)) {
                color = "#f2db4c";
            }
            else if ((data >= 3.0) && (data < 4.0)) {
                color = "#f3ba4d";
            }
            else if ((data >= 4.0) && (data < 5.0)) {
                color = "#f0a76b";
            }
            else {
                color = "#f06b6b";
            }
            return color;
        }

        // Define a function we want to run once for each feature in the features array
        // Give each feature a popup describing the place and time of the earthquake
        function createCircleMarker(feature, latlng) {
            let options = {
                radius: feature.properties.mag * 9000,
                fillColor: earthquakeColour(feature.properties.mag),
                opacity: 0,
                fillOpacity: 1
            }
            return L.circle(latlng, options);
        }

        // Add popup to each marker with info of location, date and time, and magnitude of quake
        function onEachFeature(feature, layer) {
            layer.bindPopup("<h3>" + feature.properties.place +
                "</h3><hr><p>" + new Date(feature.properties.time) + "<p>" + "Magnitude: " + feature.properties.mag + "</p>");
        };

        // Create a GeoJSON layer containing the features array on the earthquakeData object
        // Run the onEachFeature function once for each piece of data in the array
        var earthquakes = L.geoJSON(earthquakeData, {
            pointToLayer: createCircleMarker,
            onEachFeature: onEachFeature
        });
        var faultLines = Array();
        var tectonicData = jsonPromise.features;
        for (var i = 0; i < tectonicData.length; i++) {
            faultLines.push(tectonicData[i].geometry.coordinates);
        };

        console.log(faultLines);
        var tectonics = L.polyline(faultLines, { color: "orange" })

        // Sending our earthquakes layer to the createMap function
        createMap(earthquakes, tectonics);
    });
};



// Create map legend
function createLegend() {
    // Append legend div with svg and group
    var svg = d3.selectAll(".legend")
        .append("svg")
        .attr("height", "130px")
        .attr("width", "60px");

    var legendGroup = svg.append("g");

    // Legend colours and scale as arrays
    var colours = ["#b7f24c", "#e0f24d", "#f2db4c", "#f3ba4d", "#f0a76b", "#f06b6b"];
    var scales = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];

    // Populate legend with colours and scale
    for (var i = 0; i < colours.length; i++) {
        legendGroup.append("rect")
            .attr("x", "5px")
            .attr("y", ((20 * i) + 5))
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", colours[i]);
        legendGroup.append("text")
            .attr("x", "30px")
            .attr("y", ((20 * i) + 20))
            .text(scales[i]);
    };
};


// Create map using earthquake data and tectonic plates data
function createMap(earthquakes, tectonics) {

    // Define light map
    var satelliteMap = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 20,
        attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
    });

    var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "light-v10",
        accessToken: API_KEY
    });

    var outdoorsMap = L.tileLayer('https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Satellite": satelliteMap,
        "Light Map": lightMap,
        "Outdoors": outdoorsMap
    };

    var layers = {
        Earthquakes: earthquakes,
        faultLines: tectonics
    }
    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        "Earthquakes": layers.Earthquakes,
        "Fault Lines": layers.faultLines
    };

    // Create a legend to display information about our map
    var info = L.control({
        position: "bottomright"
    });

    // When the layer control is added, insert a div with the class of "legend"
    info.onAdd = function () {
        var div = L.DomUtil.create("div", "legend");
        return div;
    };

    // Create the map, giving it the light map 
    // and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 3,
        layers: [satelliteMap, layers.Earthquakes, layers.faultLines]
    });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Add the info legend to the map
    info.addTo(myMap);

    // Call map legend function
    createLegend();
}