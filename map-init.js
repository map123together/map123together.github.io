let gMap; // Google Map
let markers = []; // Google Map Markers
let drawingManager;
const initPosition = {
    center: {
        lat: 41.35576312110632,
        lng: -101.91683651331762
    }, zoom: 4
};
const avaIndexes = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
    'k', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
    'U', 'V', 'W', 'X', 'Y', 'Z'
];

function initMap() { // Creates a map object with a click listener
    gMap = new google.maps.Map(document.getElementById('map'), {
        mapTypeControl: false,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER,
        },
        fullscreenControl: false,
        styles: [{
            featureType: 'poi',
            stylers: [{ visibility: 'off' }]  // Turn off POI.
        },
        {
            featureType: 'transit.station',
            stylers: [{ visibility: 'off' }]  // Turn off bus, train stations etc.
        }],
        disableDoubleClickZoom: true,
        streetViewControl: false,
    });

    // Init Drawing Tools --------------------------------------------------
    drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.MARKER,
        drawingControl: false,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [
                google.maps.drawing.OverlayType.MARKER,
                google.maps.drawing.OverlayType.POLYLINE
            ],
        },
        markerOptions: {
            label: {
                color: 'white',
                text: '1',
            }
        },
        polylineOptions: {
            strokeColor: "#3389e5",
            strokeWeight: 5,
        }
    });
    drawingManager.setMap(gMap);
    drawingManager.setDrawingMode(null);

    // Init Direction Service --------------------------------------------------
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true
    });
    directionsRenderer.setMap(gMap);

    //--------------------------------------------------------------------------------------------
    const markerListBox = document.getElementById("markerListBox");
    gMap.controls[google.maps.ControlPosition.LEFT_CENTER].push(markerListBox);

    //--------------------------------------------------------------------------------------------
    const logoBox = document.getElementById("logoBox");
    gMap.controls[google.maps.ControlPosition.TOP_LEFT].push(logoBox);

    //--------------------------------------------------------------------------------------------
    const userBox = document.getElementById("userIconBox");
    let pictureUrl = readCookie('gUserPicture');
    if (pictureUrl) {
        document.getElementById("mt-user-picture").src = pictureUrl;
    }
    gMap.controls[google.maps.ControlPosition.TOP_LEFT].push(userBox);

    // Search box --------------------------------------------------------------------------------------------
    const searchInput = document.getElementById("pac-input");
    const searchBox = new google.maps.places.SearchBox(searchInput);

    gMap.controls[google.maps.ControlPosition.TOP_RIGHT].push(searchInput);

    // Bias the SearchBox results towards current map's viewport.
    gMap.addListener("bounds_changed", () => {
        searchBox.setBounds(gMap.getBounds());
    });

    searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        // For each place, get the icon, name and location.
        const bounds = new google.maps.LatLngBounds();

        places.forEach((place) => {
            if (!place.geometry || !place.geometry.location) {
                console.log("Returned place contains no geometry");
                return;
            }
            const icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25),
            };

            let searchReMarker = new google.maps.Marker({
                map: gMap,
                icon,
                title: place.name,
                position: place.geometry.location,
            });

            searchReMarker.addListener("dblclick", function (e) {
                this.setMap(null);
            })

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });

        gMap.fitBounds(bounds);
    });

    // Direction Box -------------------------------------------------------------
    document.getElementById('getDirBtn').addEventListener('click', () => {
        // TODO
        calculateAndDisplayRoute(directionsService, directionsRenderer,
            markers[markers.length - 2].getPosition(),
            markers[markers.length - 1].getPosition());
    });

    // Tool Box -----------------------------------------------------------------------
    let toolBox = document.getElementById('toolbox');
    gMap.controls[google.maps.ControlPosition.TOP_CENTER].push(toolBox);

    // Add Button Function ------------------------------------------
    document.getElementById("btnradio0").addEventListener("click", () => {
        drawingManager.setDrawingMode(null);
    });

    // Add Button Function ------------------------------------------
    document.getElementById("btnradio1").addEventListener("click", () => {
        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.MARKER);
    });

    // Add Button Function  ------------------------------------------ 
    document.getElementById("btnradio2").addEventListener("click", () => {
        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYLINE);
    });

    google.maps.event.addListener(drawingManager, 'overlaycomplete', function (event) {

        let newShape = event.overlay;

        // Save Symbols ---
        if (event.type == google.maps.drawing.OverlayType.MARKER) {
            // Update marker text
            let label = newShape.label;
            label.text = getNextMarkerIndex();

            // Save Marker
            let position = { lat: newShape.getPosition().lat(), lng: newShape.getPosition().lng() };
            let mtMarker = { "position": position, "timestamp": Date.now() };
            addMtMarker(mtMarker); // DB
            markers.push(newShape); // LOCAL
        }

        if (event.type == google.maps.drawing.OverlayType.POLYLINE) {
            // Save Polyline
            console.log(newShape.getPath().getArray());
        }

        // Remove Symbols ---
        google.maps.event.addListener(newShape, 'dblclick', () => {
            if (event.type == google.maps.drawing.OverlayType.MARKER) {
                newShape.setMap(null);
                removeMarker(newShape); // LOCAL
            }

            if (event.type == google.maps.drawing.OverlayType.POLYLINE) {
                newShape.setMap(null);
                // TODO: remove polyline locally
            }

        });
    });
}

function calculateAndDisplayRoute(directionsService, directionsRenderer, startPos, endPos) {

    directionsService
        .route({
            origin: startPos, //{ lat: 41, lng: 101},
            destination: endPos,
            travelMode: google.maps.TravelMode.DRIVING,
        })
        .then((response) => {
            //console.log(response);
            directionsRenderer.setDirections(response);
        })
        .catch((e) => console.log("Directions Request Failed"));
}

function displayMtMarkers(mtMarkers, gMap) {
    mtMarkers.forEach(mtMarker => {
        let isExMarker = false;
        markers.forEach(marker => {
            if (mtMarker.position.lat == marker.getPosition().lat()
                && mtMarker.position.lng == marker.getPosition().lng()) {
                isExMarker = true;
            }
        });

        if (!isExMarker) {
            let newMarker = new google.maps.Marker({
                position: mtMarker.position,
                label: {
                    'text': getNextMarkerIndex(),
                    'color': 'white'
                },
                map: gMap,
            });
            markers.push(newMarker);

            // Double-click Listener: Remove Marker
            newMarker.addListener("dblclick", function (e) {
                removeMarker(this);
            })
        }
    });
}

function removeMarker(oldMarker) {
    let newMarkers = [];
    markers.forEach(marker => {
        if (oldMarker.getPosition().lat() == marker.getPosition().lat()
            && oldMarker.getPosition().lng() == marker.getPosition().lng()) {
            marker.setMap(null);
            let mtMarker = {
                "position": {
                    "lat": oldMarker.getPosition().lat(),
                    "lng": oldMarker.getPosition().lng()
                }
            };
            removeMtMarker(mtMarker);
        } else {
            newMarkers.push(marker);
        }
    });
    markers = newMarkers;
}

function panToMapCenter(center, zoom, gMap) { // Pan to center
    let googleLatAndLong = new google.maps.LatLng(center.lat, center.lng);
    gMap.setCenter(googleLatAndLong);
    gMap.setZoom(zoom);
}

/* ========================= Utility ========================= */
function getNextMarkerIndex() {
    let avaIndexes = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
        'k', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W'
    ];
    let numMarkers = markers.length;
    let nextIndex = '';
    if (numMarkers <= avaIndexes.length && avaIndexes[numMarkers]) {
        nextIndex = avaIndexes[numMarkers];
    }

    return nextIndex;
}