const baseUrl = 'https://1and2.xyz/'; // MT API Base URL
const mapid = getAllUrlParams().mapid; // Current Map ID

verifyLogin(); // TODO
initMtMap();
logoutBtnFunction();

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
        sharingToken = mtMap.sharingToken;
        displayMtMarkers(mtMap, gMap);
        displayMessageList(mtMap.messages);
        displaySharedUserPicture(mtMap.sharedWith);
        console.log("Init MT Markers: " + mtMap.markers.length);


        let hasSharedwith = mtMap.sharedWith.includes(uid);
        if (!hasSharedwith) {
          let urlParams = getAllUrlParams(window.location.href);
          if (mtMap.sharingToken == urlParams.token) {
            // Add uid to sharedWith
            addMtSharedwith(uid);
          } else {
            removeMtSharedwith(uid);
            window.location.href = "my-maps.html";
          }
        }

        // Pan to the last position
        panToMapCenter(mtMap.center, mtMap.zoom, gMap);

        document.title = mtMap.name;
      }
    } else {
      window.location.href = 'my-maps.html';
    }

    setInterval(getExistingMtMarkers, 3000);
    setInterval(updateMtCenter, 5000);

  };

  sendMtRequest(method, dir, null, afterMapViewSet);
}

function getExistingMtMarkers() {

  let method = 'GET';
  fetchTime = new Date().getTime();
  let dir = 'map/id/' + mapid + '?lft=' + fetchTime;

  let parseRes = (response) => {
    let mtMap = {};
    let resposeJson = JSON.parse(response);
    if (resposeJson[0]) {
      mtMap = resposeJson[0];
      if (mtMap.markers) {
        lastFetchTime = mtMap.last_fetch_time;

        displayMtMarkers(mtMap, gMap);
        displayMessageList(mtMap.messages);
      }
    }
  };

  sendMtRequest(method, dir, null, parseRes);
}

function addMtMarker(marker) {

  let method = 'POST';
  let dir = 'map/id/' + mapid + '/add-marker';

  let parseRes = (response) => {

    let resposeJson = JSON.parse(response);
    if (resposeJson) { }
  };

  sendMtRequest(method, dir, marker, parseRes);
}

function addMtSharedwith(uid) {

  let method = 'POST';
  let dir = 'map/id/' + mapid + '/add-sharedwith';

  let parseRes = (response) => {

    let resposeJson = JSON.parse(response);
    if (resposeJson) { }
  };

  let reqBody = { "uid": uid }

  sendMtRequest(method, dir, reqBody, parseRes);
}

function removeMtSharedwith(uid) {

  let method = 'POST';
  let dir = 'map/id/' + mapid + '/delete-sharedwith';

  let parseRes = (response) => {

    let resposeJson = JSON.parse(response);
    if (resposeJson) { }
  };

  let reqBody = { "uid": uid }

  sendMtRequest(method, dir, reqBody, parseRes);
}

function addMtMessage(message) {

  let method = 'POST';
  let dir = 'map/id/' + mapid + '/add-message';

  let parseRes = (response) => {

    let resposeJson = JSON.parse(response);
    if (resposeJson) {
      // Nothing
    }
  };

  sendMtRequest(method, dir, message, parseRes);
}

function removeMtMarker(markerPos) {

  let method = 'POST';
  let dir = 'map/id/' + mapid + '/delete-marker';

  let parseRes = (response) => {

    let resposeJson = JSON.parse(response);
    if (resposeJson) { }
  };

  sendMtRequest(method, dir, markerPos, parseRes);
}

function updateMtLabelOrder() {

  let method = 'POST';
  let dir = 'map/id/' + mapid + '/update-markers-order';

  let orderedList = getOrderedMarkerList();
  //console.log(orderedList);

  let parseRes = (response) => {

    let resposeJson = JSON.parse(response);
    if (resposeJson) {
      //console.log(resposeJson);
    }
  };

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

    let resposeJson = JSON.parse(response);
    if (resposeJson) {
      //console.log(resposeJson);
    }
  };

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
  let dir = 'user/login';
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

function logoutBtnFunction() {
  document.getElementById("logoutBtn").addEventListener("click", function () {
    document.cookie = "gUserCredential=";
    window.location.href = "index.html";
  });
}