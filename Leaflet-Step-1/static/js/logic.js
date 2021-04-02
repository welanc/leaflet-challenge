var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function (data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);

});

function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function createCircleMarker(feature, latlng) {
        let options = {
            radius: feature.properties.mag * 9000,
            fillColor: perc2Color(feature.properties.mag, minMag, maxMag),
            weight: 0.5,
            color: "black",
            opacity: 0.5,
            fillOpacity: 0.5
        }
        return L.circle(latlng, options);
    }

    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
            "</h3><hr><p>" + new Date(feature.properties.time) + "<p>" + "Magnitude: " + feature.properties.mag + "</p>");
    };

    // Retrieve all locations in JSON and store in variable
    var magnitude = Array();

    earthquakeData.forEach(data => {
        magnitude.push(data.properties.mag);
    });

    var minMag = Math.min(...magnitude);
    var maxMag = Math.max(...magnitude);

    ////////////////////////////////////////////////////////////////////
    // Colour gradient retrieved on 02 April 2021 by mlocati & roboriaan
    // @ https://gist.github.com/mlocati/7210513
    function perc2Color(perc, min, max) {
        var base = (max - min);

        if (base == 0) { perc = 100; }
        else {
            perc = (perc - min) / base * 100;
        }
        var r, g, b = 0;
        if (perc < 50) {
            g = 255;
            r = Math.round(5.1 * perc);
        }
        else {
            r = 255;
            g = Math.round(510 - 5.1 * perc);
        }
        var h = r * 0x10000 + g * 0x100 + b * 0x1;
        return '#' + ('000000' + h.toString(16)).slice(-6);
    };
    ////////////////////////////////////////////////////////////////////

    // Log to confirm locations retrieved
    // console.log(magnitude);

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: createCircleMarker,
        onEachFeature: onEachFeature
    });

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {

    // Define lightmap
    var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "light-v10",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    // var baseMaps = {
    //     "Light Map": lightMap
    //     "Dark Map": darkmap
    // };

    // // Create overlay object to hold our overlay layer
    // var overlayMaps = {
    //     Earthquakes: earthquakes
    // };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 3,
        layers: [lightMap, earthquakes]
    });
}