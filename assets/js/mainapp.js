/*
* Google Maps documentation: http://code.google.com/apis/maps/documentation/javascript/basics.html
* Geolocation documentation: http://dev.w3.org/geo/api/spec-source.html
*/
  var travelMode = "BICYCLING";
  var elevationService = null;
  var directionsService = null;
  var mousemarker = null, GeoMarker;
  var markers = [];
  var polyline = null;
  var chart, lat, lng;
  var SAMPLES = 100;
  var distance = 0;
  var distances = [];
  var markersArray = [];
  var iActiveMarker = -1;
  var defaultLatLng = new google.maps.LatLng(38.92, -94.62);// default Lat\Lng = Leawood

  var station_list;

  var map, featureList, GeoMarker;
  var markersArray = [];
  var iActiveMarker = -1;

google.load('visualization', '1', { 'packages': ['corechart', 'table', 'geomap'] })

$(window).resize(function ()
{
    sizeLayerControl();
});

$(".dropdown-menu li a").click(function ()
{
    var selText = $(this).text();

    $(this).parents('.btn-group').find('.dropdown-toggle').html(selText + ' <span class="caret"></span>');
    if (selText.substr(0, 1) == "W") {
        travelMode = "walking";
    }
    else {
        travelMode = "bicycling";
    }
});

$(document).on("click", ".feature-row", function (e)
{
    $(document).off("mouseout", ".feature-row", clearHighlight);
    sidebarClick(parseInt($(this).attr("id"), 10));
});

$(document).on("click", ".feature-row", function (e)
{
    $(document).off("mouseout", ".feature-row", clearHighlight);
    sidebarClick(parseInt($(this).attr("id"), 10));
});

$(document).ready(function ($)
{
	// Create an ElevationService.
	elevator = new google.maps.ElevationService();
});

$('#weatherModal').on('shown.bs.modal', function (e)
{
    getWeather(lat,lng);
})

$(function ()
{
    $('#showWeatherLyr').change(function ()
    {
        getWeather(lat,lng);
    })
})

$(document).ready(function ($)
{
	GeoMarker = new GeolocationMarker();

	google.maps.event.addListenerOnce(GeoMarker, 'position_changed', function() {
	  map.setCenter(this.getPosition());
	  map.fitBounds(this.getBounds());
	});

	google.maps.event.addListener(GeoMarker, 'geolocation_error', function(e) {
	  alert('There was an error obtaining your position. Message: ' + e.message);
	});
});

function tooltip(temp_distance, temp_elevation) {
	return 'Distance: ' + temp_distance + ' mi.\nElevation: ' + temp_elevation + ' ft.';
}

function barMouseOver(e) {
	chart.setSelection([e]);
}

function barMouseOut(e) {
	chart.setSelection([{'row': null, 'column': null}]);
}

$(document).ready(function ($)
{
  $(function () {
          if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
            $(".youtube").YouTubePlaylistModal({autoplay:0, width:300, height:210});
          }
          else {
            $(".youtube").YouTubePlaylistModal({autoplay:0, width:640, height:480});
          }
  });
});

$(document).on("mouseover", ".feature-row", function (e)
{
    highlight.clearLayers().addLayer(L.circleMarker([$(this).attr("lat"), $(this).attr("lng")], highlightStyle));
});

$(document).on("mouseout", ".feature-row", clearHighlight);

$("#about-btn").click(function ()
{
    $("#aboutModal").modal("show");
    $(".navbar-collapse.in").collapse("hide");
    return false;
});

$("#emergency-btn").click(function ()
{
    $("#helpModal").modal("show");
    $(".navbar-collapse.in").collapse("hide");
    return false;
});

$("#legend-btn").click(function ()
{
    $("#legendModal").modal("show");
    $(".navbar-collapse.in").collapse("hide");
    return false;
});

$("#weather-btn").click(function ()
{
    $("#weatherModal").modal("show");
    $(".navbar-collapse.in").collapse("hide");
    return false;
});

$("#directions-btn").click(function ()
{
    $("#directionsModal").modal("show");
    $(".navbar-collapse.in").collapse("hide");
    return false;
});

$("#login-btn").click(function ()
{
    $("#loginModal").modal("show");
    $(".navbar-collapse.in").collapse("hide");
    return false;
});

$("#list-btn").click(function ()
{
    $('#sidebar').toggle();
    setDIVHeight();
    return false;
});

$("#nav-btn").click(function ()
{
    $(".navbar-collapse").collapse("toggle");
    return false;
});

$("#sidebar-toggle-btn").click(function ()
{
    $("#sidebar").toggle();
    setDIVHeight();
    return false;
});

$("#sidebar-hide-btn").click(function ()
{
    $('#sidebar').hide();
    setDIVHeight();
});

function sizeLayerControl()
{
    $(".leaflet-control-layers").css("max-height", $("#map").height() - 50);
}

function clearHighlight()
{
    highlight.clearLayers();
}

function sidebarClick(id)
{
    var layer = markerClusters.getLayer(id);
    map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 17);
    layer.fire("click");
    /* Hide sidebar and go to the map on small screens */
    if (document.body.clientWidth <= 767) {
        $("#sidebar").hide();
        setDIVHeight();
    }
}

function setDIVHeight()
{
    var theDiv = $('#map-page');
    var screen = $(window).height(); //$.mobile.getScreenHeight(),
        header = $("header").hasClass("ui-header") ? $("ui-header").outerHeight() - 1 : $("ui-header").outerHeight(),
        footer = $("footer").hasClass("ui-footer") ? $("ui-footer").outerHeight() - 1 : $("ui-footer").outerHeight(),
        contentCurrent = $("content").outerHeight() - $("content").height(),
        content = screen - header - footer - contentCurrent;
    $(".ui-content").height(content);

}

  // Add a marker and trigger recalculation of the path and elevation
  function addMarker(latlng, doQuery) {
    if (markers.length < 10) {
      
      var marker = new google.maps.Marker({
        position: latlng,
        map: map,
        draggable: true
      })
      
      google.maps.event.addListener(marker, 'dragend', function(e) {
        updateElevation();
      });
      
      markers.push(marker);
      
      if (doQuery) {
        updateElevation();
      }
      
      if (markers.length == 10) {
        document.getElementById('address').disabled = true;
      }
    } else {
      alert("No more than 10 points can be added");
    }
  }
  
  // Trigger the elevation query for point to point
  // or submit a directions request for the path between points
  function updateElevation() {
    if (markers.length > 1) {
      var travelMode = document.getElementById("mode").value;
      if (travelMode != 'direct') {
        calcRoute(travelMode);
      } else {
        var latlngs = [];
        for (var i in markers) {
          latlngs.push(markers[i].getPosition())
        }
        elevationService.getElevationAlongPath({
          path: latlngs,
          samples: 256
        }, plotElevation);
      }
    }
  }
  
function calcRoute(mode)
{
	// Create a new chart in the elevation_chart DIV.
        chart = new google.visualization.AreaChart(document.getElementById('elevation_chart'));
 
    var start = $("#routeStart").val(); // 	$( '#routeStart' ).val( address );
    var end = $("#routeEnd").val();
	
	var waypoints = [];
	var bounds = new google.maps.LatLngBounds();
    
	// compose a array with options for the directions/route request
    var request = {
        origin: start,
        destination: end,
		waypoints: waypoints,
        unitSystem: google.maps.UnitSystem.IMPERIAL,
        travelMode: google.maps.DirectionsTravelMode[mode],
        avoidHighways: true
        };
		
    // get the travelmode, startpoint and via point from the form
        mode = travelMode;

    switch (mode) {
        case "bicycling":
            request.travelMode = google.maps.DirectionsTravelMode.BICYCLING;
            break;
            //case "driving":
            request.travelMode = google.maps.DirectionsTravelMode.DRIVING;
            //break;
            //case "transit":
            request.travelMode = google.maps.DirectionsTravelMode.TRANSIT;
            //break;
        case "walking":
            request.travelMode = google.maps.DirectionsTravelMode.WALKING;
            break;
    }
		
	// call elevation service API
	//elevationService = new google.maps.ElevationService();	
    // call the directions API
    directionsService.route(request, function (response, status)
    {
        if (status == google.maps.DirectionsStatus.OK) {
            // directions returned by the API, clear the directions panel before adding new directions
            $('#directionsPanel').empty();
            // display the direction details in the container
            directionsDisplay.setDirections(response);
			var startPt = new google.maps.LatLng(response.routes[0].legs[0].start_location.A, response.routes[0].legs[0].start_location.F);
			var endPt = new google.maps.LatLng(response.routes[0].legs[0].end_location.A, response.routes[0].legs[0].end_location.F);
			var path = [startPt, endPt];
			// Create a PathElevationRequest object using this array.
			// Ask for 256 samples along that path.
			var pathRequest = {
				'path': path,
				'samples': 100
			}
			path.forEach(function (element, index) { bounds.extend(element) })
			map.fitBounds(bounds);
			elevator.getElevationAlongPath({
			  path: response.routes[0].overview_path,
			  samples: SAMPLES
			}, plotElevation);

			// Initiate the path request.
			//elevator.getElevationAlongPath(pathRequest, plotElevation);
        } else {
            // alert an error message when the route could nog be calculated.
            if (status == 'ZERO_RESULTS') {
                alert('No route could be found between the origin and destination.');
            } else if (status == 'UNKNOWN_ERROR') {
                alert('A directions request could not be processed due to a server error. The request may succeed if you try again.');
            } else if (status == 'REQUEST_DENIED') {
                alert('This webpage is not allowed to use the directions service.');
            } else if (status == 'OVER_QUERY_LIMIT') {
                alert('The webpage has gone over the requests limit in too short a period of time.');
            } else if (status == 'NOT_FOUND') {
                alert('At least one of the origin, destination, or waypoints could not be geocoded.');
            } else if (status == 'INVALID_REQUEST') {
                alert('The DirectionsRequest provided was invalid.');
            } else {
                alert("There was an unknown error in your request. Requeststatus: nn" + status);
            }
        }
    });
}
    // Takes an array of ElevationResult objects, draws the path on the map
    // and plots the elevation profile on a Visualization API ColumnChart.
    function plotElevation(results, status)
    {
        if (status != google.maps.ElevationStatus.OK) {
            return;
        }
		distance = 0;
        var elevations = results;

        // Extract the elevation samples from the returned results
        // and store them in an array of LatLngs.
        
        var elevationPath = [];
        for (var i = 0; i < results.length; i++) {
            elevationPath.push(elevations[i].location);
        }
		
		if (polyline) {
			  polyline.setMap(null);
			}
			
		polyline = new google.maps.Polyline({
		  path: elevationPath,
		  strokeColor: "#000000",
		  map: map});

        // Extract the data from which to populate the chart.
        // Because the samples are equidistant, the 'Sample'
        // column here does double duty as distance along the
        // X axis.
        data = new google.visualization.DataTable();
        data.addColumn('string', 'Sample');
        data.addColumn('number', 'Elevation');
		data.addColumn({'type': 'string', 'role': 'tooltip'});
		//data.addColumn({type:'string', role:'annotation'});

		for (var i = 0; i < results.length - 1; i++) {
			// Compute distance in meters
			distances[i] = google.maps.geometry.spherical.computeDistanceBetween (elevations[i].location, elevations[i+1].location);
			// Convert meters to miles
		    var tempDistance = (parseFloat(distance) + distances[i]).toFixed(2); //parseFloat(n).toFixed(3)
			// Convert meters to miles
			distance = parseFloat(tempDistance * 0.000621371).toFixed(2);
			//distance = distance + distances[i];
			//distance = Math.round((distance*10)/10);
			elevation = Math.round((elevations[i].elevation*10)/10);
			data.addRow(['', Math.round((elevations[i].elevation*10)/10),tooltip(distance, elevation)]);
			distance = tempDistance;
		}

        // Draw the chart using the data within its DIV.
        document.getElementById('elevation_chart').style.display = 'block';
        chart.draw(data, {
            width: 300,
            height: 170,
            legend: 'none',
            titleY: 'Elevation (ft)',
			hAxis: {title: 'Distance (mi)', showTextEvery: 20, maxAlternation: 100, slantedText: 'false'},
			//backgroundColor: '#f2f2f2',
			animation: {duration: 200, easing: 'linear'},
			//axisTitlesPosition: "in",
			bar: {groupWidth: '100%'},
			focusBorderColor: '#00ff00'
        });
		
		google.visualization.events.addListener(chart, 'onmouseover', function(e) {
		  if (mousemarker == null) {
			mousemarker = new google.maps.Marker({
			  position: elevations[e.row].location,
			  map: map,
			  icon: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
			});
		  } else {
			mousemarker.setPosition(elevations[e.row].location);
		  }
		});
		
		google.maps.event.addListener(marker, 'dragstart', function() {
		updateElevation();
		});
		
		google.maps.event.addListener(marker, 'dragend', function(e) {
        updateElevation();
      });

     //loaded fully
    $("#loading").hide();
    }

    // function to get weather for an address
    function getWeather(lat, lng)
    {
        if (lat != '' && lng != '') {
            $("#weather").val("Retrieving weather...");										// write temporary response while we get the weather
            $.getJSON("http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lng + "&units=imperial", function (data)
            {	// add '&units=imperial' to get U.S. measurements
                var currWeather = new Array();								// create array to hold our weather response data
                currWeather['currTemp'] = Math.round(data.main.temp);				// current temperature
                currWeather['highTemp'] = Math.round(data.main.temp_max);			// today's high temp
                currWeather['lowTemp'] = Math.round(data.main.temp_min);			// today's low temp
                currWeather['humidity'] = Math.round(data.main.humidity);			// humidity (in percent)
                currWeather['pressure'] = data.main.pressure * 0.02961339710085;	// barometric pressure (converting hPa to inches)
                currWeather['pressure'] = currWeather['pressure'].toFixed(2);		// barometric pressure (rounded to 2 decimals)

                currWeather['description'] = data.weather[0].description;				// short text description (ie. rain, sunny, etc.)
                currWeather['icon'] = "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png";	// 50x50 pixel png icon
                currWeather['cloudiness'] = data.clouds.all;							// cloud cover (in percent)
                currWeather['windSpeed'] = Math.round(data.wind.speed);				// wind speed

                currWeather['windDegree'] = data.wind.deg;							// wind direction (in degrees)
                currWeather['windCompass'] = Math.round((currWeather['windDegree'] - 11.25) / 22.5);	// wind direction (compass value)

                // array of direction (compass) names
                var windNames = new Array("North", "North Northeast", "Northeast", "East Northeast", "East", "East Southeast", "Southeast", "South Southeast", "South", "South Southwest", "Southwest", "West Southwest", "West", "West Northwest", "Northwest", "North Northwest");
                // array of abbreviated (compass) names
                var windShortNames = new Array("N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW");
                currWeather['windDirection'] = windNames[currWeather['windCompass']];	// convert degrees and find wind direction name


                var response = "Current Weather: " + currWeather['currTemp'] + "\xB0 and " + currWeather['description'];
                var spokenResponse = "It is currently " + currWeather['currTemp'] + " degrees and " + currWeather['description'];

                if (currWeather['windSpeed'] > 0) {											// if there's wind, add a wind description to the response
                    response = response + " with winds out of the " + windNames[currWeather['windCompass']] + " at " + currWeather['windSpeed'];
                    spokenResponse = spokenResponse + " with winds out of the " + windNames[currWeather['windCompass']] + " at " + currWeather['windSpeed'];
                    if (currWeather['windSpeed'] == 1) {
                        response += " mile per hour";
                        spokenResponse += " mile per hour";
                    } else {
                        response += " miles per hour";
                        spokenResponse += " miles per hour";
                    }
                }

                console.log(data);												// log weather data for reference (json format) 
                $("#weatherLat").val(Math.floor(lat * 1000 + 0.5) / 1000);      // write current Latitude to modal, round within 0.001
                $("#weatherLng").val(Math.floor(lng * 1000 + 0.5) / 1000);      // write current Longitude to modal, round within 0.001
                $("#weather").val(response);									// write current weather to textarea
                speakText(spokenResponse);
            });
        } else {
            return false;														// respond w/error if no address entered
        }
    }

    // function to speak a response
    function speakText(response)
    {

        // setup synthesis
        var msg = new SpeechSynthesisUtterance();
        var voices = window.speechSynthesis.getVoices();
        msg.voice = voices[2];					// Note: some voices don't support altering params
        msg.voiceURI = 'native';
        msg.volume = 1;							// 0 to 1
        msg.rate = 1;							// 0.1 to 10
        msg.pitch = 2;							// 0 to 2
        msg.text = response;
        msg.lang = 'en-US';

        speechSynthesis.speak(msg);
    }
  
  // Clear all overlays, reset the array of points, and hide the chart
  function reset() {
    if (polyline) {
      polyline.setMap(null);
    }
    
    for (var i in markers) {
      markers[i].setMap(null);
    }
    
    markers = [];
    
    document.getElementById('elevation_chart').style.display = 'none';
  }

 
$(document).bind('touchmove', function (e)
	{
		e.preventDefault();
	});

$(document).bind('pageinit', function ()
	{
		$.mobile.defaultPageTransition = 'none';
	});

$("#routeForm").submit(function (event)
	{
		// onclick, set the geocoded address to the start-point formfield
		$('#routeStart').val(address);
		// call the calcRoute function to start calculating the route
		calcRoute(travelMode);
		event.preventDefault();
	});
	
function getURLParam(name) {
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.href);
  return (results === null ? "" : decodeURIComponent(results[1]));
}

function drawMap(pos)
{
    // set route options (draggable means you can alter/drag the route in the map)
    var rendererOptions = { draggable: true };
    directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);

    var myOptions = {
        zoom: 16,
        center: pos,
        panControl: false,
        dragging: true,
        mapTypeId: google.maps.MapTypeId.TERRAIN,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
            position: google.maps.ControlPosition.TOP_RIGHT,
            mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.TERRAIN]
        },
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL,
            position: google.maps.ControlPosition.RIGHT_BOTTOM
        },
        streetViewControl: true,
        streetViewControlOptions: {
            position: google.maps.ControlPosition.TOP_LEFT
        }
    };
    map = new google.maps.Map(document.getElementById("map"), myOptions);

    GeoMarker = new GeolocationMarker();
    GeoMarker.setCircleOptions({ fillColor: '#808080', radius: 10});

    google.maps.event.addListenerOnce(GeoMarker, 'position_changed', function ()
    {
        map.setCenter(this.getPosition());
        map.fitBounds(this.getBounds());
    });

    google.maps.event.addListener(GeoMarker, 'geolocation_error', function (e)
    {
        alert('There was an error obtaining your position. Message: ' + e.message);
    });

    GeoMarker.setMap(map);

    // bind the map to the directions
    directionsDisplay.setMap(map);
    // point the directions to the container for the direction details
    directionsDisplay.setPanel(document.getElementById("directionsPanel"));

    //initialize the fusion table layer
    layer = new google.maps.FusionTablesLayer({
        query: {
            select: 'description',
            from: tableid[0]
        }
    }, {
        suppressInfoWindows: false,
        query: "select * from " + tableid[0]
        //    query: "select * from " + tableid[0] + " where Display = 1 OR SbdvTypeDs LIKE '" + subdivtype + "' "
    });

    //draw the fusion table layer on the google map
    layer.setMap(map);

    //var wxoverlay = new WXTiles();
    //wxoverlay.addToMap( map );
    //wxoverlay.addColorBar( 'big', 'horiz', 'BottomLeft' );
    //document.getElementById( 'tSelect' ).appendChild( wxoverlay.getTSelect() );
    //document.getElementById( 'wxSelect' ).appendChild( wxoverlay.getVSelect() );

    var bikeLayer = new google.maps.BicyclingLayer();
    bikeLayer.setMap(map);

    // Create the DIV to hold the control and
    // call the CenterControl() constructor passing
    // in this DIV.
    /*var centerControlDiv = document.createElement( 'div' );
    var centerControl = new CenterControl( centerControlDiv, map );

    centerControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push( centerControlDiv );

    var homeControlDiv = document.getElementById( 'ddControl' );
    homeControlDiv.style.display = "block";
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push( homeControlDiv );
    */

    //return;
    //add a click event listener to the layer
    var id = "";
    google.maps.event.addListener(layer, 'click', function (e) { clickRow(e) });

    // Add an overlay to the map of current lat/lng
    var marker = new google.maps.Marker({
        position: pos,
        map: map,
        title: "You are here!"
    });
	    //loaded fully
    $("#loading").hide();
}

// start the geolocation API
if (navigator.geolocation) {
    // when geolocation is available on your device, run this function
    navigator.geolocation.getCurrentPosition(function (position)
    {
        lat = position.coords.latitude;
        lng = position.coords.longitude;
        var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        // convert the position returned by the geolocation API to a google coordinate object
        // then try to reverse geocode the location to return a human-readable address
        geocoder.geocode({ 'latLng': pos }, function (results, status)
        {
            if (status == google.maps.GeocoderStatus.OK) {
                // if the geolocation was recognized and an address was found
                if (results[0]) {
                    // add a marker to the map on the geolocated point
                    marker = new google.maps.Marker({
                        position: pos,
                        map: map
                    });
                    // compose a string with the address parts
                    //var address = results[0].address_components[1].long_name + ' ' + results[0].address_components[0].long_name + ', ' + results[0].address_components[3].long_name
                    address = results[0].formatted_address;
                    // set the located address to the link, show the link and add a click event handler
                    $('.autoLink span').html(address).parent().show().click(function ()
                    {
                        // onclick, set the geocoded address to the start-point formfield
                        $('#routeStart').val(address);
                        // call the calcRoute function to start calculating the route
                        calcRoute(travelMode);
                    });
                }
            } else {
                // if the address couldn't be determined, alert and error with the status message
                alert("Geocoder failed due to: " + status);
            }
        });
        // Location found, show map with these coordinates
        drawMap(pos);
    })
} else {
    // when no geolocation is available, alert this message
    alert('Geolocation not supported or not enabled.');
    drawMap(defaultLatLng);  // No geolocation support, show default map
}

var MY_MAPTYPE_ID = 'TERRAIN';
//var tableid = ['1XHCdMaMg2jFc_cR-_vQiKPKNg0xG8pnd2d06ULqR'];
var tableid = ['12Q-kOL7tSssLOu6uu142OdOyYgCUfE9_HgszYJRt']; // KC Google Transit Public Data Feed Fusion Table
var directionsDisplay, address;
var directionsService = new google.maps.DirectionsService();
var geocoder = new google.maps.Geocoder();

var featureOpts = [
    {
        "stylers": [
        { "saturation": -100 },
        { "lightness": 34 },
        { "gamma": 0.62 }
        ]
    }
];

/**
* @constructor
* @implements {google.maps.MapType}
*/
function CoordMapType()
{
}

CoordMapType.prototype.tileSize = new google.maps.Size(256, 256);
CoordMapType.prototype.maxZoom = 19;

CoordMapType.prototype.getTile = function (coord, zoom, ownerDocument)
{
    var div = ownerDocument.createElement('div');
    div.innerHTML = coord;
    div.style.width = this.tileSize.width + 'px';
    div.style.height = this.tileSize.height + 'px';
    div.style.fontSize = '10';
    div.style.borderStyle = 'solid';
    div.style.borderWidth = '1px';
    div.style.borderColor = '#AAAAAA';
    div.style.backgroundColor = '#E5E3DF';
    return div;
};

CoordMapType.prototype.name = 'Tile #s';
CoordMapType.prototype.alt = 'Tile Coordinate Map Type';

//var map;
var leawood = new google.maps.LatLng(41.850033, -87.6500523);
var coordinateMapType = new CoordMapType();

document.ontouchmove = function (e) { e.preventDefault(); }

// Remove the green rollover marker when the mouse leaves the chart
function clearMouseMarker() {
	if (mousemarker != null) {
	  mousemarker.setMap(null);
	  mousemarker = null;
	}
}

$(document).ready(function ()
{

    setDIVHeight();

    $(window).resize(function ()
    {
        setDIVHeight();
    });

    function setDIVHeight()
    {
        var theDiv = $('#map-page');
        var screen = $(window).height() //$.mobile.getScreenHeight(),
            header = $("header").hasClass("ui-header") ? $("ui-header").outerHeight() - 1 : $("ui-header").outerHeight(),
            footer = $("footer").hasClass("ui-footer") ? $("ui-footer").outerHeight() - 1 : $("ui-footer").outerHeight(),
            contentCurrent = $("content").outerHeight() - $("content").height(),
            content = screen - header - footer - contentCurrent;
        $(".ui-content").height(content);

    }

    $(document).bind('touchmove', function (e)
    {
        e.preventDefault();
    });

    $(document).bind('pageinit', function ()
    {
        $.mobile.defaultPageTransition = 'none';
    });

    $("#routeForm").submit(function (event)
    {
        // onclick, set the geocoded address to the start-point formfield
        $('#routeStart').val(address);
        // call the calcRoute function to start calculating the route
        calcRoute(travelMode);
        event.preventDefault();
    });

    // start the geolocation API
    if (navigator.geolocation) {
        // when geolocation is available on your device, run this function
        navigator.geolocation.getCurrentPosition(function (position)
        {
            var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            // convert the position returned by the geolocation API to a google coordinate object
            // then try to reverse geocode the location to return a human-readable address
            geocoder.geocode({ 'latLng': pos }, function (results, status)
            {
                if (status == google.maps.GeocoderStatus.OK) {
                    // if the geolocation was recognized and an address was found
                    if (results[0]) {
                        // add a marker to the map on the geolocated point
                        marker = new google.maps.Marker({
                            position: pos,
                            map: map
                        });
                        // compose a string with the address parts
                        //var address = results[0].address_components[1].long_name + ' ' + results[0].address_components[0].long_name + ', ' + results[0].address_components[3].long_name
                        address = results[0].formatted_address;
                        // set the located address to the link, show the link and add a click event handler
                        $('.autoLink span').html(address).parent().show().click(function ()
                        {
                            // onclick, set the geocoded address to the start-point formfield
                            $('#routeStart').val(address);
                            // call the calcRoute function to start calculating the route
                            calcRoute(travelMode);
                        });
                    }
                } else {
                    // if the address couldn't be determined, alert and error with the status message
                    alert("Geocoder failed due to: " + status);
                }
            });
            // Location found, show map with these coordinates
            drawMap(pos);
        })
    } else {
        // when no geolocation is available, alert this message
        alert('Geolocation not supported or not enabled.');
        drawMap(defaultLatLng);  // No geolocation support, show default map
    }

	function clickRow(e) {
	//id = "" + parseInt(e.row.AIMSFID.value);
	id = "Route " + parseInt( e.row.name.value );
	//subdiv = e.row["SbdvName"].value;
	//subdivtype = e.row["SbdvTypeDs"].value;
	el = document.getElementById(id);

	//add the subdiv record to the list if it doesn't exist, otherwise just highlight it
	if (el) {
	el.scrollIntoView(true);
	el.style.backgroundColor = "#9fc5e8";
	setTimeout("document.getElementById('" + id + "').style.backgroundColor = '#fff'", 2000);
	}
	//get the data table from fusion tables
	//var queryText = encodeURIComponent( "select FID, SHAPE from 588329 WHERE Display = 1" );
	//var queryText = encodeURIComponent("select AIMSFID, SbdvName, SHAPE from 588329 SbdvTypeDs LIKE '" + subdivtype + "' ORDER BY SbdvName");
	//var queryText = encodeURIComponent( "select AIMSFID, SbdvName, SHAPE from 588329 WHERE Display = 1 ORDER BY SbdvName" );
	//var query = new google.visualization.Query( 'http://www.google.com/fusiontables/gvizdata?tq=' + queryText );

	//query.send( zoomTo );
	}
	
    function zoomTo(response)
    {
        if (!response) {
            alert('no response');
            return;
        }
        if (response.isError()) {
            alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
            return;
        }
        FTresponse = response;
        //for more information on the response object, see the documentation
        //http://code.google.com/apis/visualization/documentation/reference.html#QueryResponse
        numRows = response.getDataTable().getNumberOfRows();
        numCols = response.getDataTable().getNumberOfColumns();

        var bounds = new google.maps.LatLngBounds();
        for (i = 0; i < numRows; i++) {
            var point = new google.maps.LatLng(
					parseFloat(response.getDataTable().getValue(i, 0)),
					parseFloat(response.getDataTable().getValue(i, 1)));
            bounds.extend(point);
        }
        // zoom to the bounds
        map.fitBounds(bounds);
    }

    function notFound(msg)
    {
        alert('Could not find your location!')
    }
    function foundYou(position)
    {
        // convert the position returned by the geolocation API to a google coordinate object
        var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        // then try to reverse geocode the location to return a human-readable address
        geocoder.geocode({ 'latLng': latlng }, function (results, status)
        {
            if (status == google.maps.GeocoderStatus.OK) {
                // if the geolocation was recognized and an address was found
                if (results[0]) {
                    // add a marker to the map on the geolocated point
                    marker = new google.maps.Marker({
                        position: latlng,
                        map: map
                    });
                    // compose a string with the address parts
                    var address = results[0].address_components[1].long_name + ' ' + results[0].address_components[0].long_name + ', ' + results[0].address_components[3].long_name
                    // set the located address to the link, show the link and add a click event handler
                    $('.autoLink span').html(address).parent().show().click(function ()
                    {
                        // onclick, set the geocoded address to the start-point formfield
                        $('#routeStart').val(address);
                        // call the calcRoute function to start calculating the route
                        calcRoute(travelMode);
                    });
                }
            } else {
                // if the address couldn't be determined, alert and error with the status message
                alert("Geocoder failed due to: " + status);
            }
        });
    }
}
);
