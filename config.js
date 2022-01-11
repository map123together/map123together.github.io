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
        
        console.log(position);
    });
}

// Adds a marker to the map.
function addMarker(position, gMap) {
    // Add the marker at the clicked location, and add the next-available label
    // from the array of alphabetical characters.
    
    let markerLabel = labelIndex.toString();
    
    labelIndex++;

    let newMarker = new google.maps.Marker({
        position: position,
        label: markerLabel,
        map: gMap,
    });

    newMarker.addListener("dblclick", function (e) {
        console.log("DBClick");

        let markerTobeDelPos = { "position": { "lat": this.position.lat, "lng": this.position.lng } };
        markers = removeMarkerFromMarkers(markerTobeDelPos, markers);
        markersJson = JSON.stringify(markers);
        storeMarkerJson(markersJson);

        this.setMap(null);
    })

    // Prepare Json for DB
    let timestamp = Date.now();
    let markerPos = { "position": position, "label": markerLabel, "timestamp": timestamp };

    markers.push(markerPos);

    markersJson = JSON.stringify(markers);
    storeMarkerJson(markersJson);
}

function displayExistingMarkers(markers, gMap) {
    markers.forEach(marker => {
        let newMarker = new google.maps.Marker({
            position: marker.position,
            label: marker.label,
            map: gMap,
        });

        // Double-click Listener
        newMarker.addListener("dblclick", function (e) {
            console.log("Existing marker DBClick");

            let markerTobeDelPos = { "position": { "lat": this.getPosition().lat(), "lng": this.getPosition().lng() } };
            console.log(this.position);
            markers = removeMarkerFromMarkers(markerTobeDelPos, markers);
            markersJson = JSON.stringify(markers);
            //storeMarkerJson(markersJson);

            this.setMap(null);
        })
    });
}

function storeMarkerJson(markersJson) {
    let req = new XMLHttpRequest();

    req.onreadystatechange = () => {
        if (req.readyState == XMLHttpRequest.DONE) {
            //console.log(req.responseText);
        }
    };

    req.open("PUT", "https://api.jsonbin.io/b/614d2432aa02be1d444d907f", true);
    req.setRequestHeader("Content-Type", "application/json");
    req.setRequestHeader("secret-key", "$2a$10$m2JwCOPaSuOe3oTrm.5M8.of6auH0WcpmoYnjxukpRNmVcQGOamW6");
    req.send(markersJson);
}

function removeMarkerFromMarkers(markerTobeDelPos, markers) {
    for (let index = 0; index < markers.length; index++) {
        if (markerTobeDelPos.position.lat == markers[index].position.lat &&
            markerTobeDelPos.position.lng == markers[index].position.lng) {
            markers.splice(index, 1);
            console.log("Removed " + index);
        }

    }
    return markers;
}

/* ========================= Other Functions ========================= */

function makeInfoBox(controlDiv) {
    let logoBox = `
    <div style="
        border: 2px solid #ffffff;
        border-radius: 2px;
        box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px; 
        background-color:#ffffff;
        margin-top: 10px;
        margin-left: 10px;
        margin-bottom: 22px;
        text-align : center;
        height: 37px;
        ">
            <div style="
            "><a href="">
                <img style="
                margin-left: auto;
                margin-right: auto;
                width: 100%;
                height: auto;
                height: 37px;
                "
                src="./ms-icon-144x144.png"/>
                </a>
             </div>
    </div>`;//   font-size:18px;padding:6px;
    let controlUI = createElementFromHTML(logoBox);
    controlDiv.appendChild(controlUI);
}

function makeUserBox(controlDiv) {
    let userBox = `
    <div style="
        border: 2px solid #ffffff;
        border-radius: 2px;
        box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px; 
        background-color:#ffffff;
        margin-top: 10px;
        margin-right: 10px;
        margin-bottom: 22px;
        text-align : center;
        height: 37px;
        ">
            <div style="
            "><a href="">
                <img style="
                margin-left: auto;
                margin-right: auto;
                width: 100%;
                height: auto;
                height: 37px;
                width: 37px;
                "
                src="./user.jpeg"/>
                </a>
             </div>
    </div>`;//   font-size:18px;padding:6px;
    let controlUI = createElementFromHTML(userBox);
    controlDiv.appendChild(controlUI);
}

function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    // Change this to div.childNodes to support multiple top-level nodes
    return div.firstChild;
}