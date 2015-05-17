/*
* Google Maps documentation: http://code.google.com/apis/maps/documentation/javascript/basics.html
* Geolocation documentation: http://dev.w3.org/geo/api/spec-source.html
*/

var map, featureList; //, boroughSearch = [], theaterSearch = [], museumSearch = [];

$(window).resize(function ()
{
    sizeLayerControl();
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

/*
$(document).ready(function ($)
{
    $.ajax({
        url: "http://api.wunderground.com/api/77c87f761eca6c8d/geolookup/conditions/q/KS/Leawood.json",
        dataType: "jsonp",
        success: function (parsed_json)
        {
            var location = parsed_json['location']['city'];
            var temp_f = parsed_json['current_observation']['temp_f'];
            //alert("Current temperature in " + location + " is: " + temp_f);
        }
    });

    //var $toggle = $(weatherDrop).parent().siblings('.dropdown-toggle');
    $(".btn:first-child").html($(this).text() + ' <span class="caret"></span>');
    //$toggle.html("<i class=\"icon icon-envelope icon-white\"></i> " + temp_f + "<span class=\"caret\"></span>")
});
*/

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

$("#full-extent-btn").click(function ()
{
    map.fitBounds(boroughs.getBounds());
    $(".navbar-collapse.in").collapse("hide");
    return false;
});

$("#legend-btn").click(function ()
{
    $("#legendModal").modal("show");
    $(".navbar-collapse.in").collapse("hide");
    return false;
});//directionsModal

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

function calcRoute()
{
    // get the travelmode, startpoint and via point from the form
    var travelMode = "BICYCLING";  //$('input[name="travelMode"]:checked').val();
    var start = $("#routeStart").val(); // 	$( '#routeStart' ).val( address );
    var end = $("#routeEnd").val();
    // compose a array with options for the directions/route request
    var request = {
        origin: start,
        destination: end,
        unitSystem: google.maps.UnitSystem.IMPERIAL,
        travelMode: google.maps.DirectionsTravelMode[travelMode]
    };
    // call the directions API
    directionsService.route(request, function (response, status)
    {
        if (status == google.maps.DirectionsStatus.OK) {
            // directions returned by the API, clear the directions panel before adding new directions
            $('#directionsPanel').empty();
            // display the direction details in the container
            directionsDisplay.setDirections(response);
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

//google.maps.event.addListenerOnce(map, 'idle', function ()
//{
    //loaded fully
    $("#loading").hide();
//});

$(document).bind('touchmove', function (e)
{
    e.preventDefault();
});

$(document).bind('pageinit', function ()
{
    $.mobile.defaultPageTransition = 'none';
});

//	    networks: ['facebook', 'pinterest', 'googleplus', 'twitter', 'linkedin', 'tumblr', 'in1', 'email', 'stumbleupon', 'digg']
//$('#mydiv').share({
//    networks: ['facebook', 'pinterest', 'googleplus', 'twitter', 'tumblr', 'email']
//});

$("#routeForm").submit(function (event)
{
    // onclick, set the geocoded address to the start-point formfield
    $('#routeStart').val(address);
    // call the calcRoute function to start calculating the route
    calcRoute();
    event.preventDefault();
});

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
    
    // Add OSM layer dynamically
    var mapTypeIds = [];
            for(var type in google.maps.MapTypeId) {
                mapTypeIds.push(google.maps.MapTypeId[type]);
            }
        mapTypeIds.push("OSM");

    // bind the map to the directions
    directionsDisplay.setMap(map);
    // point the directions to the container for the direction details
    directionsDisplay.setPanel(document.getElementById("directionsPanel"));

    //initialize the fusion table layer
    layer = new google.maps.FusionTablesLayer({
        query: {
            select: 'description',
            from: tableid[0]
        }, styles: [{
            polylineOptions: {
                strokeColor: "#A6A6A6",
                strokeWeight: "5"
            }
        }, {
            where: "description LIKE '%Bicycle%'",
            polylineOptions: {
                strokeColor: "#C500FF",
                strokeWeight: "3"
            }
        }, {
            where: "description like '%Crosstown%'",
            polylineOptions: {
                strokeColor: "#0070FF",
                strokeWeight: "5"
            }
        }, {
            where: "description like '%Neighborhood%'",
            polylineOptions: {
                strokeColor: "#E69800",
                strokeWeight: "2"
            }
        }, {
            where: "description like '%Principal%'",
            polylineOptions: {
                strokeColor: "#FA3411",
                strokeWeight: "4"
            }
        }]
    }, {
        suppressInfoWindows: false,
        query: "select * from " + tableid[0]
        //    query: "select * from " + tableid[0] + " where Display = 1 OR SbdvTypeDs LIKE '" + subdivtype + "' "
    });

    //draw the fusion table layer on the google map
    layer.setMap(map);

    var bikeLayer = new google.maps.BicyclingLayer();
    bikeLayer.setMap(map);

    map.mapTypes.set("OSM", new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) {
            return "http://tile.openstreetmap.org/" + zoom + "/" + coord.x + "/" + coord.y + ".png";
        },
        tileSize: new google.maps.Size(256, 256),
        name: "OpenStreetMap",
        maxZoom: 18
    }));

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
}

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
                        calcRoute();
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
var tableid = ['1XHCdMaMg2jFc_cR-_vQiKPKNg0xG8pnd2d06ULqR'];
var directionsDisplay, address;
var directionsService = new google.maps.DirectionsService();
var geocoder = new google.maps.Geocoder();

// Default Location
var leawood = new google.maps.LatLng(38.92, -94.62);

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

var map;
var leawood = new google.maps.LatLng(41.850033, -87.6500523);
var coordinateMapType = new CoordMapType();

document.ontouchmove = function (e) { e.preventDefault(); }

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

    //	    networks: ['facebook', 'pinterest', 'googleplus', 'twitter', 'linkedin', 'tumblr', 'in1', 'email', 'stumbleupon', 'digg']
    $('#mydiv').share({
        networks: ['facebook', 'pinterest', 'googleplus', 'twitter', 'tumblr', 'email']
    });

    $("#routeForm").submit(function (event)
    {
        // onclick, set the geocoded address to the start-point formfield
        $('#routeStart').val(address);
        // call the calcRoute function to start calculating the route
        calcRoute();
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
                            calcRoute();
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
                        calcRoute();
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
