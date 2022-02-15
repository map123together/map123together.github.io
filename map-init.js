let gMap; // Google Map
let markers = []; // Google Map Markers
let isEditing = false; // UI Update Lock
let initPosition = { center: { lat: 41.35576312110632, lng: -101.91683651331762 }, zoom: 4 };
let drawingManager;

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

    // Init Drawing tools
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
        polylineOptions: {
            strokeColor: "#3389e5",
            strokeWeight: 5,
        }
    });
    drawingManager.setMap(gMap);
    drawingManager.setDrawingMode(null);

    google.maps.event.addListener(drawingManager, 'overlaycomplete', function (event) {

        let newShape = event.overlay;
        newShape.type = event.type;
        google.maps.event.addListener(newShape, 'dblclick', () => {
            newShape.setMap(null);
        });
        if (event.type == google.maps.drawing.OverlayType.MARKER) {
            // Save Marker
            let position = { lat: event.overlay.getPosition().lat(), lng: event.overlay.getPosition().lng() };
            let mtMarker = { "position": position, "timestamp": Date.now() };
            addMtMarker(mtMarker);
        }

        if (event.type == google.maps.drawing.OverlayType.POLYLINE) {
            // Save Polyline
            console.log(event.overlay.getPath().getArray());
        }
    });
    // Create the DIV to hold the control and call the makeInfoBox() constructor
    // passing in this DIV.
    //--------------------------------------------------------------------------------------------
    let logoBox = document.createElement('div');
    makeLogoBox(logoBox);
    gMap.controls[google.maps.ControlPosition.TOP_LEFT].push(logoBox);

    //--------------------------------------------------------------------------------------------
    let userBox = document.createElement('div');
    makeUserBox(userBox);
    gMap.controls[google.maps.ControlPosition.TOP_LEFT].push(userBox);

    //--------------------------------------------------------------------------------------------
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

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        gMap.fitBounds(bounds);
    });
    // End of Search box --------------------------------------------------------------------------------------------
}

function panToMapCenter(center, zoom, gMap) { // Pan to center
    let googleLatAndLong = new google.maps.LatLng(center.lat, center.lng);
    gMap.setCenter(googleLatAndLong);
    gMap.setZoom(zoom);
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
                label: '',
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

/* ========================= UI Functions ========================= */

function makeLogoBox(controlDiv) {
    let logoBox = `
        <div style="
            border: 0px solid #ffffff;
            border-radius: 2px;
            box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px;
            background-color:#ffffff;
            margin-top: 10px;
            margin-left: 10px;
            margin-bottom: 10px;
            text-align : center;
            height: 40px;
            width:auto;">
            <a href="maps.html">
                <img style="
                margin-left: auto;
                margin-right: auto;
                height: 40px;
                width: auto;
                " src="./images/Banner-sm.png"
                />
            </a>
        </div>`;//src="./ms-icon-144x144.png"
    let controlUI = createElementFromHTML(logoBox);
    controlDiv.appendChild(controlUI);
}

function makeUserBox(controlDiv) {
    let pictureUrl = readCookie('gUserPicture');
    let userBox = `
        <div style="
            border: 0px solid #ffffff;
            border-radius: 2px;
            box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px; 
            background-color:#ffffff;
            margin-top: 10px;
            margin-left: 10px;
            margin-right: 10px;
            margin-bottom: 10px;
            text-align : center;
            height: 40px;
            width: 40px;">
            <div data-bs-toggle="modal" data-bs-target="#logoutModal" onMouseOver="this.style.cursor='pointer'">
                <img
                id="mt-user-picture" 
                style="
                margin-left: auto;
                margin-right: auto;
                margin-top: 1px;
                height: 37px;
                width: 37px;"
                src="${pictureUrl}"
                onerror="event.target.src = './images/default-user.png';"/>
            </div>
        </div>`;
    let controlUI = createElementFromHTML(userBox);
    controlDiv.appendChild(controlUI);
}

function makeToolBox(controlDiv) {
    let userBox = `
        <div style="
            border: 0px solid #ffffff;
            border-radius: 2px;
            box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px; 
            background-color:#ffffff;
            margin-top: 10px;
            margin-left: 10px;
            margin-right: 10px;
            margin-bottom: 10px;
            height: 40px;
            width: 185px;">
            <div style="padding-top:5px; margin-left: 5px;"
                class="btn-group-sm" role="group" aria-label="Basic radio toggle button group">
                
                <input type="button" class="btn-check" name="btnradio" id="btnradio0" autocomplete="off">
                <label class="btn btn-outline-primary" for="btnradio0"><i class="bi bi-arrows-move"></i></label>

                <input type="button" class="btn-check" name="btnradio" id="btnradio1" autocomplete="off">
                <label class="btn btn-outline-primary" for="btnradio1"><i class="bi bi-dot"></i></label>
            
                <input type="button" class="btn-check" name="btnradio" id="btnradio2" autocomplete="off">
                <label class="btn btn-outline-primary" for="btnradio2"><i class="bi bi-dash-lg"></i></label>
            
                <input type="button" class="btn-check" name="btnradio" id="btnradio4" autocomplete="off">
                <label class="btn btn-outline-primary" for="btnradio4"><i class="bi bi-cursor-text"></i></label>
            |
                <input type="button" class="btn-check" id="btnradio5" autocomplete="off">
                <label class="btn btn-outline-primary" for="btnradio5"><i class="bi bi-send"></i></label>
            </div>
        </div>`;
    let controlUI = createElementFromHTML(userBox);
    controlDiv.appendChild(controlUI);
}

function createElementFromHTML(htmlString) {
    let div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}