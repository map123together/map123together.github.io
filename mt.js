const baseUrl = 'https://1and2.xyz/';  // MT API Base URL
const mapid   = getAllUrlParams().mapid; // Current Map ID

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
      existingMarkers = mtMap.markers;

      // Markers
      displayMtMarkers(existingMarkers, gMap);
      console.log("Fetched MT Markers: " + existingMarkers.length);
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

/* ========================= Helper Functions ========================= */

function sendMtRequest(method, directory, requestBody, callback) {
  let req = new XMLHttpRequest();

  req.onreadystatechange = () => {
    if (req.readyState == XMLHttpRequest.DONE) {
      if(callback){
        callback(req.responseText);
      }
    }
  };

  switch (method) {
    case 'GET':
      req.open("GET", baseUrl + directory, true);
      req.setRequestHeader("Content-Type", "application/json");
      req.send();
      break;
    case 'POST':
      let jsonBody = JSON.stringify(requestBody);
      req.open("POST", baseUrl + directory, true);
      req.setRequestHeader("Content-Type", "application/json");
      req.send(jsonBody);
      break;
    default:
      break;
  }


}

function getAllUrlParams(url) {

  // get query string from url (optional) or window
  var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

  // we'll store the parameters here
  var obj = {};

  // if query string exists
  if (queryString) {

    // stuff after # is not part of query string, so get rid of it
    queryString = queryString.split('#')[0];

    // split our query string into its component parts
    var arr = queryString.split('&');

    for (var i = 0; i < arr.length; i++) {
      // separate the keys and the values
      var a = arr[i].split('=');

      // set parameter name and value (use 'true' if empty)
      var paramName = a[0];
      var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];

      // (optional) keep case consistent
      paramName = paramName.toLowerCase();
      if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();

      // if the paramName ends with square brackets, e.g. colors[] or colors[2]
      if (paramName.match(/\[(\d+)?\]$/)) {

        // create key if it doesn't exist
        var key = paramName.replace(/\[(\d+)?\]/, '');
        if (!obj[key]) obj[key] = [];

        // if it's an indexed array e.g. colors[2]
        if (paramName.match(/\[\d+\]$/)) {
          // get the index value and add the entry at the appropriate position
          var index = /\[(\d+)\]/.exec(paramName)[1];
          obj[key][index] = paramValue;
        } else {
          // otherwise add the value to the end of the array
          obj[key].push(paramValue);
        }
      } else {
        // we're dealing with a string
        if (!obj[paramName]) {
          // if it doesn't exist, create property
          obj[paramName] = paramValue;
        } else if (obj[paramName] && typeof obj[paramName] === 'string') {
          // if property does exist and it's a string, convert it to an array
          obj[paramName] = [obj[paramName]];
          obj[paramName].push(paramValue);
        } else {
          // otherwise add the property
          obj[paramName].push(paramValue);
        }
      }
    }
  }

  return obj;
}