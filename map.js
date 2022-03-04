const baseUrl = 'https://1and2.xyz/'; // MT API Base URL
const mapid = getAllUrlParams().mapid; // Current Map ID

verifyLogin(); // TODO
initMtMap();

function initMtMap() {

  let method = 'GET';
  let dir = 'map/id/' + mapid;

  let afterMapViewSet = (response) => {
    let mtMap = {};
    let resposeJson = JSON.parse(response);
    if (resposeJson[0]) {
      mtMap = resposeJson[0];

      if (mtMap) {
        // Get existing markers
        displayMtMarkers(mtMap, gMap);
        displayMessageList(mtMap.messages);
        displaySharedUserPicture(mtMap.sharedWith);
        console.log("Init MT Markers: " + mtMap.markers.length);
        // Pan to the last position
        panToMapCenter(mtMap.center, mtMap.zoom, gMap);

        document.title = mtMap.name;
      }
    } else {
      window.location.href = 'maps.html';
    }

    setInterval(getExistingMtMarkers, 2000);
    setInterval(updateMtCenter, 5000);

  };

  sendMtRequest(method, dir, null, afterMapViewSet);
}

function getExistingMtMarkers() {

  let method = 'GET';
  let dir = 'map/id/' + mapid + '?lft=' + lastFetchTime;

  let parseRes = (response) => {
    let mtMap = {};
    let resposeJson = JSON.parse(response);
    if (resposeJson[0]) {
      mtMap = resposeJson[0];
      if (mtMap.markers) {
        lastFetchTime = mtMap.last_fetch_time;
        displayMtMarkers(mtMap, gMap);
        displayMessageList(mtMap.messages);
        displaySharedUserPicture(mtMap.sharedWith);
      }
    }
  };

  sendMtRequest(method, dir, null, parseRes);
}

function addMtMarker(marker) {

  let method = 'POST';
  let dir = 'map/id/' + mapid + '/add-marker';

  let parseRes = (response) => {
    isEditing = false;
    let resposeJson = JSON.parse(response);
    if (resposeJson) {}
  };
  isEditing = true;
  sendMtRequest(method, dir, marker, parseRes);
}

function addMtMessage(message) {

  let method = 'POST';
  let dir = 'map/id/' + mapid + '/add-message';

  let parseRes = (response) => {
    isEditing = false;
    let resposeJson = JSON.parse(response);
    if (resposeJson) {}
  };
  isEditing = true;
  sendMtRequest(method, dir, message, parseRes);
}

function removeMtMarker(markerPos) {

  let method = 'POST';
  let dir = 'map/id/' + mapid + '/delete-marker';

  let parseRes = (response) => {
    isEditing = false;
    let resposeJson = JSON.parse(response);
    if (resposeJson) {}
  };
  isEditing = true;
  sendMtRequest(method, dir, markerPos, parseRes);
}

function updateMtLabelOrder() {

  let method = 'POST';
  let dir = 'map/id/' + mapid + '/update-markers-order';

  let orderedList = getOrderedMarkerList();
  //console.log(orderedList);

  let parseRes = (response) => {
    isEditing = false;
    let resposeJson = JSON.parse(response);
    if (resposeJson) {
      //console.log(resposeJson);
    }
  };
  isEditing = true;
  sendMtRequest(method, dir, orderedList, parseRes);
}

function updateMtCenter() {

  let method = 'POST';
  let dir = 'map/id/' + mapid + '/update-center';

  let position = {};
  position.center = {
    lat: gMap.center.lat(),
    lng: gMap.center.lng()
  };
  position.zoom = gMap.zoom;

  let parseRes = (response) => {
    isEditing = false;
    let resposeJson = JSON.parse(response);
    if (resposeJson) {
      //console.log(resposeJson);
    }
  };
  isEditing = true;
  sendMtRequest(method, dir, position, parseRes);
}

function getUserPicture2(uid) {
  document.getElementById("mt-user-picture-2").src = 'https://lh3.googleusercontent.com/a-/AOh14GjTkrYDEGQ1UENis_7yXolyA-14Tm18HOvBrkI1Bw=s96-c';
  // TODO
  /*
  let method = 'GET';
  let dir = 'user/id/' + uid;
 
  let parseRes = (response) => {
    let resposeJson = JSON.parse(response);
      if (resposeJson.picture) {
        document.getElementById("mt-user-picture-2").src = resposeJson.picture;
        document.getElementById("userIconBox2").style.display = 'block';
      } else {
        document.getElementById("mt-user-picture-2").src = '';
        document.getElementById("userIconBox2").style.display = 'none';
      }
  };

  sendMtRequest(method, dir, reqBody, parseRes);
  */
}

function verifyLogin() {

  let method = 'POST';
  let dir = 'login';
  let gUserCredential = readCookie('gUserCredential');
  let reqBody = {
    "gUserCredential": gUserCredential
  };

  let parseRes = (response) => {
    let resposeJson = JSON.parse(response);

    if (!resposeJson || !resposeJson.verified) {
      window.location.href = "index.html?openmap=" + mapid;
      document.cookie = "gUserCredential=;gUserPicture=";
    } else {
      if (resposeJson.picture) {
        document.cookie = "gUserPicture=" + resposeJson.picture;
      }

      if (resposeJson.uid) {
        uid = resposeJson.uid;
        clearTimeout(loginTimeout);
      }
    }
  };

  let redirectBack = () => {
    window.location.href = "index.html"
  }

  let loginTimeout = setTimeout(redirectBack, 5000);
  sendMtRequest(method, dir, reqBody, parseRes);
}