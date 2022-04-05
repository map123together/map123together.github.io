let uid;
let gMap; // Google Map
let sharedWith = [];
let markers = []; // Google Map Markers
let messages = [];
let sharingToken;
let drawingManager;
let fetchTime = 0;

const initPosition = {
  center: {
    lat: 41.35576312110632,
    lng: -101.91683651331762
  },
  zoom: 4
};
const avaIndexes = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'k', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
  'U', 'V', 'W', 'X', 'Y', 'Z',
  'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI'
];
let usedIndexes = [];

function initMap() { // Creates a map object with a click listener
  // Init Map --------------------------------------------------
  gMap = new google.maps.Map(document.getElementById('map'), {
    mapTypeControl: false,
    zoomControlOptions: {
      position: google.maps.ControlPosition.RIGHT_CENTER,
    },
    fullscreenControl: false,
    styles: [{
        featureType: 'poi',
        stylers: [{
          visibility: 'on'
        }] // Turn off POI.
      },
      {
        featureType: 'transit.station',
        stylers: [{
          visibility: 'off'
        }] // Turn off bus, train stations etc.
      }
    ],
    disableDoubleClickZoom: true,
    streetViewControl: false,
  });

  // Init DrawingManager -------------------------------------------
  drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.MARKER,
    drawingControl: false,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: [
        google.maps.drawing.OverlayType.MARKER
      ],
    },
    markerOptions: {
      label: {
        color: 'white',
        text: '',
      },
      icon: './images/Pin-Purple.png'
    }
  });
  drawingManager.setMap(gMap);
  drawingManager.setDrawingMode(null);

  // Init Direction Service ----------------------------------------
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer({
    suppressMarkers: true
  });
  directionsRenderer.setMap(gMap);

  // Logo Box ------------------------------------------------------
  const logoBox = document.getElementById("logoBox");
  gMap.controls[google.maps.ControlPosition.TOP_LEFT].push(logoBox);

  // Avatar Box -----------------------------------------------------
  const userBox = document.getElementById("userIconBox");
  let pictureUrl = readCookie('gUserPicture');
  if (pictureUrl) {
    document.getElementById("mt-user-picture").src = pictureUrl;
  }
  gMap.controls[google.maps.ControlPosition.TOP_LEFT].push(userBox);

  const userBox2 = document.getElementById("userIconBox2");
  gMap.controls[google.maps.ControlPosition.TOP_LEFT].push(userBox2);
  getUserPicture2();

  // Tool Box -------------------------------------------------------
  let toolBox = document.getElementById('toolbox');
  gMap.controls[google.maps.ControlPosition.TOP_CENTER].push(toolBox);
  initToolButtonFunctions();

  // Search Box ------------------------------------------------------------
  const searchInput = document.getElementById("pac-input");
  const searchBox = new google.maps.places.SearchBox(searchInput);
  gMap.controls[google.maps.ControlPosition.TOP_RIGHT].push(searchInput);
  initSearchBoxFunction(searchBox);

  // Markers & Directions Box -----------------------------------------------
  const markerListBox = document.getElementById("markerListBox");
  gMap.controls[google.maps.ControlPosition.LEFT_CENTER].push(markerListBox);
  document.getElementById('getDirBtn').addEventListener('click', () => {
    getDirections(directionsService, directionsRenderer);
  });

  // Chat Box -----------------------------------------------
  const chatBox = document.getElementById("chatBox");
  gMap.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(chatBox);

}

/** ============================ Sub-Functions ========================================== */
function initToolButtonFunctions() {
  // Hand Button Function ------------------------------------------
  document.getElementById("btnradio0").addEventListener("click", () => {
    drawingManager.setDrawingMode(null);
  });

  // Marker Button Function ------------------------------------------
  document.getElementById("btnradio1").addEventListener("click", () => {
    if (markers.length <= 10) {
      drawingManager.setDrawingMode(google.maps.drawing.OverlayType.MARKER);
    } else {
      drawingManager.setDrawingMode(null);
      document.getElementById("btnradio0").checked = true;
    }
  });

  // Landmarkers Button Function ------------------------------------------
  document.getElementById("landmarkersonoffBtn").addEventListener("click", () => {
    let islandmarkersOn = document.getElementById("landmarkersonoffBtn").checked;
    console.log(islandmarkersOn);

    if (islandmarkersOn) {
      gMap.setOptions({
        styles: [{
            featureType: 'poi',
            stylers: [{
              visibility: 'on'
            }]
          },
          {
            featureType: 'transit.station',
            stylers: [{
              visibility: 'off'
            }]
          }
        ]
      });
    } else {
      gMap.setOptions({
        styles: [{
            featureType: 'poi',
            stylers: [{
              visibility: 'off'
            }] 
          },
          {
            featureType: 'transit.station',
            stylers: [{
              visibility: 'off'
            }]
          }
        ]
      });
    }
  });

  // Chat Button Function ------------------------------------------
  document.getElementById("chatonoffBtn").addEventListener("click", () => {
    let isChatOn = document.getElementById("chatonoffBtn").checked;
    let chatBox = document.getElementById("chatBox");
    if (isChatOn) {
      chatBox.style.display = 'block';
    } else {
      chatBox.style.display = 'none';
    }
  });

  document.getElementById("getSharingLinkBtn").addEventListener("click", () => {
    let sharingModal = new bootstrap.Modal(document.getElementById('sharingModal'), {});

    let sharableLink = window.location.host + '/map.html?mapid=' + mapid + '&token=' + sharingToken;
    document.getElementById("sharableLink").value = sharableLink;

    sharingModal.show();
    copyLinkBtnFunction();

  });

  document.getElementById("messageEnterBtn").addEventListener("click", () => {
    let newMessageInput = document.getElementById("newMessage");
    let newMessage = newMessageInput.value.trim();
    newMessageInput.value = '';
    newMessageInput.placeholder = 'Sending...';
    setTimeout(() => {
      newMessageInput.value = '';
      newMessageInput.placeholder = 'New Message';
    }, 1000);

    let message = {
      "uid": uid,
      content: newMessage
    };

    addMtMessage(message);

  });

  // After Drawing ------------------------------------------
  google.maps.event.addListener(drawingManager, 'overlaycomplete', function (event) {

    let newShape = event.overlay;

    // Save Symbols ---
    if (event.type == google.maps.drawing.OverlayType.MARKER) {
      // Update marker text
      newShape.label.text = getNextMarkerIndex();

      // Save Marker
      let position = {
        lat: newShape.getPosition().lat(),
        lng: newShape.getPosition().lng()
      };

      let mtMarker = {
        "position": position,
        "label": newShape.label.text
      };
      addMtMarker(mtMarker);
      markers.push(newShape);

      if (markers.length >= 10) {
        drawingManager.setDrawingMode(null);
        document.getElementById("btnradio0").checked = true;
      }

      // Refresh Marker List
      addMarkerToMarkerList(newShape.label.text, '', position, true);
    }

    google.maps.event.addListener(newShape, 'dblclick', () => {
      if (event.type == google.maps.drawing.OverlayType.MARKER) {
        removeMarker(newShape);
      }
    });
  });
}

function initSearchBoxFunction(searchBox) {
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
}

function getDirections(directionsService, directionsRenderer) {

  let markersOrder = getOrderedMarkerList();
  let orderedMarkers = [];

  if (markers.length > 1) {

    // Reorder Markers
    markersOrder.forEach(orderedLabel => {
      markers.forEach(marker => {
        if (marker.label.text == orderedLabel.label) {
          orderedMarkers.push(marker);
        }
      });
    });

    let startPos = orderedMarkers[0].getPosition();
    let endPos = orderedMarkers[orderedMarkers.length - 1].getPosition();
    let waypts = [];
    for (let i = 1; i < orderedMarkers.length - 1; i++) {
      waypts.push({
        location: orderedMarkers[i].getPosition(),
        stopover: true,
      });
    }

    directionsService
      .route({
        origin: startPos,
        destination: endPos,
        waypoints: waypts,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING,
      })
      .then((response) => {
        directionsRenderer.setDirections(response);

        let legs = response.routes[0].legs;
        let directionLegSpans = document.getElementsByClassName('directionLegSpan');
        let markerDescs = document.getElementsByClassName('markerListItem');

        for (let i = 0; i < directionLegSpans.length; i++) {
          directionLegSpans[i].innerHTML = '';
          directionLegSpans[i].style.display = 'none';
          //markerDescs[i].value = '';
        }
        let totalDistance = 0;
        let totalDuration = 0;
        let i;
        for (i = 0; i < directionLegSpans.length - 1; i++) {
          directionLegSpans[i].style.display = 'block';
          directionLegSpans[i].innerHTML = 'Distance: ' + legs[i].distance.text + ' (' + legs[i].duration.text + ') <i class="bi bi-arrow-down"></i>';

          if (markerDescs[i].value == '') {
            markerDescs[i].value = legs[i].start_address;
          }

          totalDistance += legs[i].distance.value;
          totalDuration += legs[i].duration.value;
        };

        totalDistance = Math.round(parseInt(totalDistance) / 1585.88 * 10) / 10;
        totalDuration = Math.floor(parseInt(totalDuration) / 60);

        directionLegSpans[directionLegSpans.length - 1].style.display = 'block';
        directionLegSpans[directionLegSpans.length - 1].innerHTML = '<strong>Total Distance: ' + totalDistance + ' mi</strong> (' + totalDuration + ' mins)';
        directionLegSpans[directionLegSpans.length - 1].innerHTML += '<br><button id="exportDirBtn" class="btn btn-sm btn-link">Print</button>';

        if (markerDescs[markerDescs.length - 1].value == '') {
          markerDescs[markerDescs.length - 1].value = legs[i - 1].end_address;
        }


        defineExportBtn(legs);
      })
      .catch((e) => console.log("Directions Service Failed"));
  }
}

function displayMtMarkers(mtMap, gMap) {
  let lastFetchTime = mtMap.last_fetch_time;
  let mtMarkers = mtMap.markers;
  let mtMarkersOrder = mtMap['markers-order'];

  if (lastFetchTime >= fetchTime) {
    // Reorder Markers
    let orderedMtMarkers = [];
    if (mtMarkersOrder) {
      mtMarkersOrder.forEach(orderedLabel => {
        mtMarkers.forEach(mtMarker => {
          if (mtMarker.label == orderedLabel.label) {
            mtMarker.desc = orderedLabel.desc;
            orderedMtMarkers.push(mtMarker);
          }
        });
      });
    } else {
      orderedMtMarkers = mtMarkers;

    }

    // Remove older markers
    markers.forEach(marker => {
      let toberemoved = true;
      orderedMtMarkers.forEach(mtMarker => {
        if (mtMarker.position.lat == marker.getPosition().lat() &&
          mtMarker.position.lng == marker.getPosition().lng()) {
          toberemoved = false;
        }
      });
      if (toberemoved) {
        removeMarker(marker);
      }
    });

    // Display
    orderedMtMarkers.forEach(mtMarker => {
      let isExMarker = false;
      markers.forEach(marker => {
        if (mtMarker.position.lat == marker.getPosition().lat() &&
          mtMarker.position.lng == marker.getPosition().lng()) {
          isExMarker = true;
        }
      });

      if (!isExMarker) {
        let labelTxt = '';
        if (mtMarker.label) {
          labelTxt = mtMarker.label;
          usedIndexes.push(labelTxt);
        } else {
          labelTxt = getNextMarkerIndex();
        }
        let labelDesc = '';
        if (mtMarker.desc) {
          labelDesc = mtMarker.desc;
        }

        let newMarker = new google.maps.Marker({
          position: mtMarker.position,
          label: {
            'text': labelTxt,
            'color': 'white'
          },
          'icon': './images/Pin-Blue.png',
          map: gMap,
        });

        markers.push(newMarker);

        // Display Marker List
        addMarkerToMarkerList(labelTxt, labelDesc, mtMarker.position, false);

        // Remove Marker
        newMarker.addListener("dblclick", function (e) {
          removeMarker(this);
        })
      }
    });

    slist(document.getElementById("markerList"));
    getOrderedMarkerList();
  }
}

function addMarkerToMarkerList(labelTxt, labelDesc, markerPos, updateMtDB = true) {
  let markerList = document.getElementById('markerList');
  let listItem = `
        <li class="list-group-item"
            id="markerListItem-${labelTxt}">
            <tt>${labelTxt}.</tt>
            <input type="text" class="markerListItem" 
            id="markerDesc-${labelTxt}"
            value="${labelDesc}"
            data-label="${labelTxt}" draggable="false" />
            &emsp;<i class="bi bi-justify"></i>
            
            <div class="directionLegSpan" 
              style="text-align:center;display: none; margin-top: 8px">
                <br>
            </div>
        </li>
    `;
  markerList.insertAdjacentHTML('beforeend', listItem);
  slist(document.getElementById("markerList"));

  document.getElementById("markerDesc-" + labelTxt).addEventListener('change', function () {
    updateMtLabelOrder();
  });

  document.getElementById("markerDesc-" + labelTxt).addEventListener('focus', function () {
    let googleLatAndLong = new google.maps.LatLng(markerPos.lat, markerPos.lng);
    gMap.panTo(googleLatAndLong);
  });

  if (updateMtDB) {
    updateMtLabelOrder();
  }
}

function removeMarker(oldMarker) {
  let newMarkers = [];
  markers.forEach(marker => {
    if (
      oldMarker.getPosition().lat() == marker.getPosition().lat() &&
      oldMarker.getPosition().lng() == marker.getPosition().lng()
    ) {

      marker.setMap(null); // Remove marker from map
      // Remove marker from list
      document.getElementById("markerListItem-" + oldMarker.label.text).remove();

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
  updateMtLabelOrder();
  markers = newMarkers;
}

function displayMessageList(mtMessages) {
  let messageList = document.getElementById('messageList');

  // Remove duplicate
  if (mtMessages) {
    mtMessages.forEach(mtMessage => {
      let isDup = false;
      messages.forEach(message => {
        if (mtMessage.uid == message.uid && mtMessage.content == message.content) {
          isDup = true;
        }
      });
      if (!isDup) {
        messages.push(mtMessage);

        // Display
        let listItem = '';
        if (uid == mtMessage.uid) {
          listItem += `
            <tr>
              <td style="text-align: right;">${mtMessage.content}</td>
            </tr>
        `;
        } else {
          listItem += `
            <tr>
              <td>${mtMessage.content}</td>
            </tr>
        `;
        }
        messageList.insertAdjacentHTML('beforeend', listItem);
      }
    });
  }
}

function displaySharedUserPicture(mtSharedWith) {
  for (let i = 0; i < mtSharedWith.length; i++) {
    if (mtSharedWith[i] != uid) {
      getUserPicture2(mtSharedWith[i]);
      document.getElementById("userIconBox2").style.display = 'block';
    }
  }
  if (mtSharedWith.length < 2) {
    document.getElementById("userIconBox2").style.display = 'none';
  }
}

function panToMapCenter(center, zoom, gMap) { // Pan to center
  let googleLatAndLong = new google.maps.LatLng(center.lat, center.lng);
  gMap.setCenter(googleLatAndLong);
  gMap.setZoom(zoom);
}

function getNextMarkerIndex() {
  let difference = avaIndexes.filter(x => !usedIndexes.includes(x));
  let nextIndex = '';
  if (difference[0]) {
    nextIndex = difference[0];
    usedIndexes.push(nextIndex);
  }

  return nextIndex;
}

function defineExportBtn(legs) {
  let expBtn = document.getElementById('exportDirBtn');
  expBtn.legs = legs;
  expBtn.addEventListener('click', function () {
    let html = '';
    let totalDistance = 0;
    let totalDuration = 0;
    html += '<ul>';
    for (i = 0; i < this.legs.length; i++) {

      html += '<li>' + this.legs[i].start_address;
      html += '<br>' + this.legs[i].distance.text + ' (' + this.legs[i].duration.text + ') &darr;<br></li>';

      totalDistance += this.legs[i].distance.value;
      totalDuration += this.legs[i].duration.value;
    };

    html += '<li>' + this.legs[i - 1].end_address + '</li>';
    html += '</ul>';
    totalDistance = Math.round(parseInt(totalDistance) / 1585.88 * 10) / 10;
    totalDuration = Math.floor(parseInt(totalDuration) / 60);

    html += '<br><br><strong>Total: ' + totalDistance + ' mi (' + totalDuration + ' mins)</strong>';

    let mywindow = window.open('', 'PRINT', 'height=400,width=600');

    mywindow.document.write('<html><head><title>' + document.title + '</title>');
    mywindow.document.write('</head><body >');
    mywindow.document.write('<h3>' + document.title + '</h3>');
    mywindow.document.write(html);
    mywindow.document.write('<p><button onclick="self.close()">Close</button></p></body></html>');

    mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus(); // necessary for IE >= 10*/

    //mywindow.print();
    //mywindow.close();

    return true;
  });

}

function copyLinkBtnFunction() {
  document.getElementById("copyLinkBtn").addEventListener("click", () => {
    let copyText = document.getElementById("sharableLink");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value);
    document.getElementById("copyLinkBtn").innerText = 'Copied';
  });
}