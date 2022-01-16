const baseUrl = 'https://1and2.xyz/';  // MT API Base URL
const mapid = getAllUrlParams().mapid; // Current Map ID

getExistingMtMap();

setInterval(getExistingMtMap, 5000);

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
        console.log("Fetched MT Markers: " + mtMap.markers.length);
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
    if (resposeJson) {
      console.log(resposeJson);
    }
  };

  sendMtRequest(method, dir, marker, null);
}

function removeMtMarker(markerPos) {

  let method = 'POST';
  let dir = 'map/id/' + mapid + '/delete-marker';

  let parseRes = (response) => {
    let resposeJson = JSON.parse(response);
    if (resposeJson) {
      console.log(resposeJson);
    }
  };

  sendMtRequest(method, dir, markerPos, null);
}