var earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(earthquakeUrl, function (data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);

});

function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function createCircleMarker(feature, latlng) {
        let options = {
            radius: feature.properties.mag * 9000,
            fillColor: earthquakeColour(feature.properties.mag),
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

    // Loop through the magnitude array and 
    // assign a colour
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

    // var minMag = Math.min(...magnitude);
    // var maxMag = Math.max(...magnitude);

    ////////////////////////////////////////////////////////////////////
    // Colour gradient retrieved on 02 April 2021 by mlocati & roboriaan
    // @ https://gist.github.com/mlocati/7210513
    // function perc2Color(perc, min, max) {
    //     var base = (max - min);

    //     if (base == 0) { perc = 100; }
    //     else {
    //         perc = (perc - min) / base * 100;
    //     }
    //     var r, g, b = 0;
    //     if (perc < 50) {
    //         g = 255;
    //         r = Math.round(5.1 * perc);
    //     }
    //     else {
    //         r = 255;
    //         g = Math.round(510 - 5.1 * perc);
    //     }
    //     var h = r * 0x10000 + g * 0x100 + b * 0x1;
    //     return '#' + ('000000' + h.toString(16)).slice(-6);
    // };
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

function createMap(earthquakes) {

    // Define light map
    var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "light-v10",
        accessToken: API_KEY
    });

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
        layers: [lightMap, earthquakes]
    });

    // Add the info legend to the map
    info.addTo(myMap);

    // Call map legend function
    createLegend();
}

