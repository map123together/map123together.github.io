let labelIndex = 1; // Marker Index
let gMap; // Google Map

/**
 * Creates a map object with a click listener and a heatmap.
 */
function initMap() {
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
    var logoBox = document.createElement('div');
    makeInfoBox(logoBox);
    gMap.controls[google.maps.ControlPosition.TOP_LEFT].push(logoBox);

    var userBox = document.createElement('div');
    makeUserBox(userBox);
    gMap.controls[google.maps.ControlPosition.TOP_LEFT].push(userBox);

    var topToolBox = document.createElement('div');
    makeTopToolBox(topToolBox);
    gMap.controls[google.maps.ControlPosition.TOP_CENTER].push(topToolBox);


    // Listen for clicks and add the marker of the click.
    google.maps.event.addListener(gMap, "click", (e) => {
        var position = {};
        position.lat = e.latLng.lat();
        position.lng = e.latLng.lng();
        position.center = { lat: gMap.center.lat(), lng: gMap.center.lng() };
        position.zoom = gMap.zoom;
        addMarker(position, gMap);
    });
}

// Adds a marker to the map.
function addMarker(position, gMap) {
    const image = 'blue-pin.png';
    // Add the marker at the clicked location
    let markerLabel = labelIndex.toString();

    labelIndex++;
    let newMarker = new google.maps.Marker({
        position: position,
        label: '', //markerLabel,
        map: gMap,
        icon: image
    });

    // Double-click Listener
    newMarker.addListener("dblclick", function (e) { // Remove Marker
        let markerPos = {
            "position": {
                "lat": this.getPosition().lat(),
                "lng": this.getPosition().lng()
            },
            "zoom": gMap.zoom,
            "center": {
                "lat": gMap.center.lat(),
                "lng": gMap.center.lng()
            }
        };
        removeMtMarker(markerPos);
        this.setMap(null);
    })

    // Prepare Json for DB
    let timestamp = Date.now();
    let marker = { "position": position, "label": markerLabel, "timestamp": timestamp };

    addMtMarker(marker);
}

function displayExistingMarkers(markers, gMap) {
    const image = 'blue-pin.png';
    markers.forEach(marker => {
        let newMarker = new google.maps.Marker({
            position: marker.position,
            label: '', //marker.label,
            map: gMap,
            icon: image
        });

        // Double-click Listener
        newMarker.addListener("dblclick", function (e) { // Remove Marker
            let markerPos = {
                "position": {
                    "lat": this.getPosition().lat(),
                    "lng": this.getPosition().lng()
                },
                "zoom": gMap.zoom,
                "center": {
                    "lat": gMap.center.lat(),
                    "lng": gMap.center.lng()
                }
            };
            removeMtMarker(markerPos);
            this.setMap(null);
        })
    });
}

/* ========================= Other Functions ========================= */

function makeInfoBox(controlDiv) {
    let logoBox = `
        <div style="
            border: 0px solid #ffffff;
            border-radius: 2px;
            box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px; 
            background-color:#ffffff;
            margin-top: 10px;
            margin-left: 10px;
            margin-bottom: 22px;
            text-align : center;
            height: 40px;
            width:auto;">
            <a href="maps.html">
                <img style="
                margin-left: auto;
                margin-right: auto;
                height: 40px;
                width: auto;
                " src="./Banner-sm.png"
                />
            </a>
        </div>`;//src="./ms-icon-144x144.png"
    let controlUI = createElementFromHTML(logoBox);
    controlDiv.appendChild(controlUI);
}

function makeUserBox(controlDiv) {
    let userBox = `
        <div style="
            border: 0px solid #ffffff;
            border-radius: 2px;
            box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px; 
            background-color:#ffffff;
            margin-top: 10px;
            margin-left: 10px;
            margin-right: 10px;
            margin-bottom: 22px;
            text-align : center;
            height: 40px;
            width: 40px;">
            <div data-bs-toggle="modal" data-bs-target="#logoutModal" onMouseOver="this.style.cursor='pointer'">
                <img style="
                margin-left: auto;
                margin-right: auto;
                margin-top: 1px;
                height: 37px;
                width: 37px;"
                src="https://lh3.googleusercontent.com/a-/AOh14Giqx3_1q2THz1Z8M0KBOSBhKuWJROQL-3RA8T6iBqA=s96-c"
                onerror="event.target.src = 'default-user.png';"/>
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
            margin-bottom: 22px;
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
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    // Change this to div.childNodes to support multiple top-level nodes
    return div.firstChild;
}