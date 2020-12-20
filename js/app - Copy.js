(function () {
  const map = L.map("map", {
    zoomSnap: 0.1,
    center: [37.7783, -118.4179],
    zoom: 6.8,
    minZoom: 6,
    maxZoom: 9,
    maxBounds: L.latLngBounds([16.0, -125.5], [45.5, -105.0])
  });
  const accessToken =
    "pk.eyJ1IjoibWFwbmFyZCIsImEiOiJja2I3dzU3d2YwOXV3Mnlta25mYWZwd2h1In0.DwLv1HMQTFGFP7fy_2ywLA";
  const yourName = "mapnard";
  const yourMap = "ckha1a34j34dc19n6k07lsdei";
  // request a mapbox raster tile layer and add to map
  L.tileLayer(
    `https://api.mapbox.com/styles/v1/${yourName}/${yourMap}/tiles/256/{z}/{x}/{y}?access_token=${accessToken}`,
    {
      attribution:
        'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
    }
  ).addTo(map);
  // call enrollment data
  omnivore
    .csv("data/ca_counties.csv")
    .on("ready", function (e) {
      drawMap(e.target.toGeoJSON());
      drawLegend(e.target.toGeoJSON()); // add this statement
      console.log(e.target);
    })
    .on("error", function (e) {
      console.log(e.error[0].message);
    });
  function drawMap(data) {
    console.log(data);
    const options = {
      pointToLayer: function (feature, ll) {
        return L.circleMarker(ll, {
          opacity: 1,
          weight: 2,
          fillOpacity: 0,
        });
      },
    };
    // create 2 separate layers from GeoJSON data
    const birthsLayer = L.geoJson(data, options).addTo(map),
      deathsLayer = L.geoJson(data, options).addTo(map);
    // fit the bounds of the map to one of the layers
    map.fitBounds(birthsLayer.getBounds());
    // adjust zoom level of map
    map.setZoom(map.getZoom() - 0.4);
    // set styling for gender
    birthsLayer.setStyle({
      color: "#9CD95F",
    });
    deathsLayer.setStyle({
      color: "#A63429",
    });
    // calling resizeCircles function
    resizeCircles(birthsLayer, deathsLayer, 1);
    sequenceUI(birthsLayer, deathsLayer);
  } // end drawMap() here
  function calcRadius(val) {
    const radius = Math.sqrt(val / Math.PI);
    return radius * 0.80; // adjust .8 as a scale factor
  }
  function resizeCircles(birthsLayer, deathsLayer, currentYear) {
    birthsLayer.eachLayer(function (layer) {
      const radius = calcRadius(
        Number(layer.feature.properties["B" + currentYear])
      );
      layer.setRadius(radius);
    });
    deathsLayer.eachLayer(function (layer) {
      const radius = calcRadius(
        Number(layer.feature.properties["D" + currentYear])
      );
      layer.setRadius(radius);
    });
    retrieveInfo(deathsLayer, currentYear);
  } // end resizeCircles
  // retrieveInfo function is used to display the current grade being queried
  function retrieveInfo(deathsLayer, currentYear) {
    // select the element and reference with variable
    // and hide it from view initially
    const info = $("#info").hide();
    // since boysLayer is on top, use to detect mouseover events
    deathsLayer.on("mouseover", function (e) {
      // remove the none class to display and show
      info.show();
      // access properties of target layer
      const props = e.layer.feature.properties;
      // populate HTML elements with relevant info
      $("#info span").html(props.CITY);
      $(".births span:first-child").html(`(year ${currentYear})`);
      $(".deaths span:first-child").html(`(year ${currentYear})`);
      $(".births span:last-child").html(
        Number(props[`B${currentYear}`]).toLocaleString()
      );
      $(".deaths span:last-child").html(
        Number(props[`D${currentYear}`]).toLocaleString()
      );
      // raise opacity level as visual affordance
      e.layer.setStyle({
        fillOpacity: 0.6,
      });
      // empty arrays for births and deaths values
      const birthsValues = [],
        deathsValues = [];
      // loop through the grade levels and push values into those arrays
      for (let i = 1; i <= 8; i++) {
        birthsValues.push(props["B" + i]);
        deathsValues.push(props["D" + i]);
      }
      // Using jQuery to select elements and invoke .sparkline() method
      $(".birthsspark").sparkline(birthsValues, {
        width: "200px",
        height: "30px",
        lineColor: "#D96D02",
        fillColor: "#d98939 ",
        spotRadius: 0,
        lineWidth: 2,
      });
      $(".deathsspark").sparkline(deathsValues, {
        width: "200px",
        height: "30px",
        lineColor: "#6E77B0",
        fillColor: "#878db0",
        spotRadius: 0,
        lineWidth: 2,
      });
    });
    // hide the info panel when mousing off layergroup and remove affordance opacity
    deathsLayer.on("mouseout", function (e) {
      // hide the info panel
      info.hide();
      // reset the layer style
      e.layer.setStyle({
        fillOpacity: 0,
      });
    });
    // when the mouse moves on the document
    $(document).mousemove(function (e) {
      // first offset from the mouse position of the info window
      info.css({
        left: e.pageX + 6,
        top: e.pageY - info.height() - 25,
      });
      // if it crashes into the top, flip it lower right
      if (info.offset().top < 4) {
        info.css({
          top: e.pageY + 15,
        });
      }
      // if it crashes into the right, flip it to the left
      if (info.offset().left + info.width() >= $(document).width() - 40) {
        info.css({
          left: e.pageX - info.width() - 80,
        });
      }
    });
  }
  // new function to facilitate comparison of parameters (boys and girls)
  function sequenceUI(birthsLayer, deathsLayer) {
    // sequenceUI function body
    // create Leaflet control for the slider
    const sliderControl = L.control({
      position: "bottomleft",
    });
    sliderControl.onAdd = function (map) {
      const controls = L.DomUtil.get("slider");
      L.DomEvent.disableScrollPropagation(controls);
      L.DomEvent.disableClickPropagation(controls);
      return controls;
    };
 //   sliderControl.addTo(map);
    const labelControl = L.control({
      position: "bottomleft",
    });
    labelControl.onAdd = function (map) {
      const controls = L.DomUtil.get("year");
      L.DomEvent.disableScrollPropagation(controls);
      L.DomEvent.disableClickPropagation(controls);
      return controls;
    };
    labelControl.addTo(map);

    $("#year input[type=range]").on("input", function () {
      // current value of slider is current grade level
      var currentYear = this.value; // value is 1 to 10
      $("#year p span").html(+currentYear + 2009 )
      // resize the circles with updated grade level
      resizeCircles(birthsLayer, deathsLayer, currentYear);
    });

    $("#slider input[type=range]").on("input", function () {
      // current value of slider is current grade level
      var currentYear = this.value;

      // resize the circles with updated grade level
      resizeCircles(birthsLayer, deathsLayer, currentYear);
    });

    // create a new control to mimic the slider for the map
    function updateYear(birthsLayer, deathsLayer, currentYear) {
      
      // create a leaflet control for the grades
      const yearControl = L.control({
        position: "bottomleft",
      });

      // when the grades are added to the map
      yearControl.onAdd = function (map) {
        const year = L.DomUtil.get("div", "year");
        L.DomEvent.disableScrollPropagation(controls);
        L.DomEvent.disableClickPropagation(controls);

        return year;
      };

      // add the year to the map
      yearControl.addTo(map);
    }
  } // sequenceUI ends here

 

  function drawLegend(data) {
    // create Leaflet control for the legend
    const legendControl = L.control({
      position: "topright"
    });

    // when the control is added to the map
    legendControl.onAdd = function (map) {
      // select the legend using id attribute of legend
      const legend = L.DomUtil.get("legend");

      // disable scroll and click functionality
      L.DomEvent.disableScrollPropagation(legend);
      L.DomEvent.disableClickPropagation(legend);

      // return the selection
      return legend;
    };

    legendControl.addTo(map);
    // add legend to the map.

    // Using JavaScript forEach method to iterate through each feature of GeoJSON data
    // It then iterates through the properties and pushes values into the array

    // empty array to hold values
    const dataValues = [];

    // loop through all features (i.e., the schools)
    data.features.forEach(function (hospital) {
      // for each grade in a school
      for (let year in hospital.properties) {

//console.log(hospital.properties); 
        // shorthand to each value
        const value = hospital.properties[year];
        // if the value can be converted to a number
        // the + operator in front of a number returns a number
        if (+value) {
          //return the value to the array
          dataValues.push(+value);
        }
      }
    });
    // verify your results!
    console.log(dataValues);

    // sort our array
    const sortedValues = dataValues.sort(function (a, b) {
      return b - a;
    });

    // round the highest number and use as our large circle diameter
    const maxValue = Math.round(sortedValues[0] / 1000) * 1000;

    // calc the diameters
    const largeDiameter = calcRadius(maxValue) * 2,
      smallDiameter = largeDiameter / 2;

    // select our circles container and set the height
    $(".legend-circles").css("height", largeDiameter.toFixed());

    // set width and height for large circle
    $(".legend-large").css({
      width: largeDiameter.toFixed(),
      height: largeDiameter.toFixed(),
    });
    // set width and height for small circle and position
    $(".legend-small").css({
      width: smallDiameter.toFixed(),
      height: smallDiameter.toFixed(),
      top: largeDiameter - smallDiameter,
      left: smallDiameter / 2,
    });

    // label the max and median value
    $(".legend-large-label").html(maxValue.toLocaleString());
    $(".legend-small-label").html((maxValue / 2).toLocaleString());

    // adjust the position of the large based on size of circle
    $(".legend-large-label").css({
      top: -11,
      left: largeDiameter + 30,
    });

    // adjust the position of the large based on size of circle
    $(".legend-small-label").css({
      top: smallDiameter - 11,
      left: largeDiameter + 30,
    });

    // insert a couple hr elements and use to connect value label to top of each circle
    $("<hr class='large'>").insertBefore(".legend-large-label");
    $("<hr class='small'>")
      .insertBefore(".legend-small-label")
      .css("top", largeDiameter - smallDiameter - 8);
  }

  function updateYear(currentYear) {
    //select the slider's input and listen for change
    $("#year span").html(currentYear);
  } // end updateGrade()
})();
