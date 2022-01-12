let labelIndex = 1; // Marker Index
let markers = []; // Markers
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
    gMap.controls[google.maps.ControlPosition.TOP_RIGHT].push(userBox);


    // Listen for clicks and add the marker of the click.
    google.maps.event.addListener(gMap, "click", (e) => {
        var position = {};
        position.lat = e.latLng.lat();
        position.lng = e.latLng.lng();
        addMarker(position, gMap);
    });
}

// Adds a marker to the map.
function addMarker(position, gMap) {
    // Add the marker at the clicked location
    let markerLabel = labelIndex.toString();

    labelIndex++;
    let newMarker = new google.maps.Marker({
        position: position,
        label: markerLabel,
        map: gMap,
    });

    // Double-click Listener
    newMarker.addListener("dblclick", function (e) { // Remove Marker
        let markerPos = { "position": { "lat": this.getPosition().lat(), "lng": this.getPosition().lng() } };
        removeMtMarker(markerPos);
        this.setMap(null);
    })

    // Prepare Json for DB
    let timestamp = Date.now();
    let marker = { "position": position, "label": markerLabel, "timestamp": timestamp };

    addMtMarker(marker);
}

function displayExistingMarkers(markers, gMap) {
    markers.forEach(marker => {
        let newMarker = new google.maps.Marker({
            position: marker.position,
            label: marker.label,
            map: gMap,
        });
        // Double-click Listener
        newMarker.addListener("dblclick", function (e) { // Remove Marker
            let markerPos = { "position": { "lat": this.getPosition().lat(), "lng": this.getPosition().lng() } };
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
            width:40px;">
            <a href="maps.html">
                <img style="
                margin-left: auto;
                margin-right: auto;
                height: auto;
                height: 40px;
                width:40px;
                "
                src="./ms-icon-144x144.png"/>
            </a>
        </div>`;
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
            margin-right: 10px;
            margin-bottom: 22px;
            text-align : center;
            height: 40px;
            width: 40px;">
            <div data-bs-toggle="modal" data-bs-target="#logoutModal" onMouseOver="this.style.cursor='pointer'">
                <img style="
                margin-left: auto;
                margin-right: auto;
                height: auto;
                height: 40px;
                width: 40px;"
                src="default-user.png"/>
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