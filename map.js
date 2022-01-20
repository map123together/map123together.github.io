const baseUrl = 'https://1and2.xyz/';  // MT API Base URL
const mapid = getAllUrlParams().mapid; // Current Map ID

verifyLogin();
getExistingMtMap();

setInterval(syncMt, 10000);

function syncMt(){
  console.log("Sync");
  let method = 'POST';
  let dir = 'map/id/' + mapid + '/sync-markers';

  let parseRes = (response) => {
    isEditing = false;
    let resposeJson = JSON.parse(response);
    if (resposeJson) {
      //console.log(resposeJson);
    }
  };

  sendMtRequest(method, dir, syncingQueue, parseRes);
  syncingQueue = { "markerAdds": [], "markerRemovals": [] };

}


function getExistingMtMap() {

  let method = 'GET';
  let dir = 'map/id/' + mapid;

  let parseRes = (response) => {
    let mtMap = {};
    let resposeJson = JSON.parse(response);
    if (resposeJson[0]) {
      mtMap = resposeJson[0];
      if (mtMap.markers) {
        displayMtMarkers(mtMap.markers, gMap);
        console.log("Fetched Marker: " + mtMap.markers.length);
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
    if (resposeJson) {
      //console.log(resposeJson);
    }
  };

  sendMtRequest(method, dir, marker, parseRes);
}

function removeMtMarker(markerPos) {

  let method = 'POST';
  let dir = 'map/id/' + mapid + '/delete-marker';

  let parseRes = (response) => {
    isEditing = false;
    let resposeJson = JSON.parse(response);
    if (resposeJson) {
      //console.log(resposeJson);
    }
  };

  sendMtRequest(method, dir, markerPos, parseRes);
}

function verifyLogin() {

  let method = 'POST';
  let dir = 'login';
  let gUserCredential = readCookie('gUserCredential');
  let reqBody = { "gUserCredential": gUserCredential };

  let parseRes = (response) => {
    let resposeJson = JSON.parse(response);

    if (!resposeJson.verified) {
      window.location.href = "index.html?openmap="+mapid;
      document.cookie = "gUserCredential=;gUserPicture=";
    } else {
      if (resposeJson.picture) {
        document.cookie = "gUserPicture=" + resposeJson.picture;
      }
    }
  };

  sendMtRequest(method, dir, reqBody, parseRes);
}