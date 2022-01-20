let gMap; // Google Map
let markers = []; // Google Map Markers
let isEditing = false; // UI Update Lock
let syncingQueue = { "markerAdds": [], "markerRemovals": [] };

function initMap() { // Creates a map object with a click listener
    gMap = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 42.36902628214271, lng: -71.10770241353738 },
        zoom: 12,
        mapTypeControl: false,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER,
        },
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

    // Create the DIV to hold the control and call the makeInfoBox() constructor
    // passing in this DIV.
    let logoBox = document.createElement('div');
    makeLogoBox(logoBox);
    gMap.controls[google.maps.ControlPosition.TOP_LEFT].push(logoBox);

    let userBox = document.createElement('div');
    makeUserBox(userBox);
    gMap.controls[google.maps.ControlPosition.TOP_LEFT].push(userBox);

    let topToolBox = document.createElement('div');
    makeTopToolBox(topToolBox);
    gMap.controls[google.maps.ControlPosition.TOP_CENTER].push(topToolBox);

    // Listen for clicks and add the marker of the click.
    google.maps.event.addListener(gMap, "click", (e) => {
        let position = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        //position.center = { lat: gMap.center.lat(), lng: gMap.center.lng() };
        //position.zoom = gMap.zoom;
        addMarker(position, gMap, true);
    });
}

function displayMtMarkers(mtMarkers, gMap) { // Add MT markers to the map
    mtMarkers.forEach(mtMarker => {
        addMarker(mtMarker.position, gMap, false);
    });
}

function addMarker(newMarkerPos, gMap, needUpdateMt) {
    let image = './images/blue-pin.png';
    let isExMarker = false;
    markers.forEach(marker => { //
        if (newMarkerPos.lat == marker.getPosition().lat()
            && newMarkerPos.lng == marker.getPosition().lng()) {
            isExMarker = true;
        }
    });

    if (!isExMarker) {
        let newMarker = new google.maps.Marker({
            position: newMarkerPos,
            label: '',
            map: gMap,
            icon: image
        });
        markers.push(newMarker);
        console.log("After Adding: " + markers.length);

        // Double-click Listener: Remove Marker
        newMarker.addListener("dblclick", function (e) {
            removeMarker(this);
        })

        if (needUpdateMt) { // update MT database
            let mtMarker = { "position": newMarkerPos };
            //addMtMarker(mtMarker);
            syncingQueue["markerAdds"].push(mtMarker);
        }
        return newMarker;
    } else {
        return null;
    }
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
            //removeMtMarker(mtMarker);
            syncingQueue["markerRemovals"].push(mtMarker);
        } else {
            newMarkers.push(marker);
        }
    });
    markers = newMarkers;
    console.log("After Removal: " + markers.length);
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

function makeTopToolBox(controlDiv) {
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
                <input type="radio" class="btn-check" name="btnradio" id="btnradio1" autocomplete="off">
                <label class="btn btn-outline-primary" for="btnradio1"><i class="bi bi-dot"></i></label>
            
                <input type="radio" class="btn-check" name="btnradio" id="btnradio2" autocomplete="off">
                <label class="btn btn-outline-primary" for="btnradio2"><i class="bi bi-dash-lg"></i></label>
            
                <input type="radio" class="btn-check" name="btnradio" id="btnradio3" autocomplete="off">
                <label class="btn btn-outline-primary" for="btnradio3"><i class="bi bi-diamond"></i></label>
            
                <input type="radio" class="btn-check" name="btnradio" id="btnradio4" autocomplete="off">
                <label class="btn btn-outline-primary" for="btnradio4"><i class="bi bi-cursor-text"></i></label>
            |
                <input type="button" class="btn-check" name="btnradio" id="btnradio5" autocomplete="off">
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