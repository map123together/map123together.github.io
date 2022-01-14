const baseUrl = 'https://1and2.xyz/';  // MT API Base URL
const mapid = getAllUrlParams().mapid; // Current Map ID


verifyLogin();

function verifyLogin() {

  let method = 'POST';
  let dir = 'login';
  let gUserCredential = readCookie('gUserCredential');
  let reqBody = { "gUserCredential": gUserCredential };

  let parseRes = (response) => {
    let resposeJson = JSON.parse(response);

    if (!resposeJson.verified) {
      window.location.href = "index.html";
    } else {
      if (resposeJson.picture) {
        document.getElementById("mt-user-picture").src = resposeJson.picture;
      }

      if (resposeJson.uid) {
        getMyMaps(resposeJson.uid);
      }
    }
  };

  sendMtRequest(method, dir, reqBody, parseRes);
}

function getMyMaps(uid) {

  let method = 'POST';
  let dir = 'map/maps';

  let reqBody = { "uid": uid };

  let parseRes = (response) => {
    let myMaps = [];
    let resposeJson = JSON.parse(response);
    console.log(resposeJson);
    myMaps = resposeJson;

    myMaps.forEach(mtMap => {
      console.log(mtMap);
      //console.log(document.getElementById('mapCardsRow'));
      document.getElementById('mapCardsRow').insertAdjacentHTML('beforeend', createMapCard(mtMap));
    });
  };

  sendMtRequest(method, dir, reqBody, parseRes);
}

function createMapCard(mtMap) {
  let lastUpdate = new Date(mtMap.last_mod_time).toLocaleString("en-US");
  let mapName = mtMap.name.substring(0, 11) + ' ...'; console.log(mapName);
  let htmlStr = `
    <div class="col-xs-6 col-sm-4 col-md-4 col-lg-auto">
        <div class="card" style="width: 10rem;">
            <img src="https://maps.googleapis.com/maps/api/staticmap?center=${mtMap.center.lat},${mtMap.center.lng}
            &zoom=${mtMap.zoom}&size=200x200&key=AIzaSyBwZQMrJr2VD6WUbIb-ljX8QD_BdfbY1c8" 
            onerror="event.target.src = 'new-map-icon.png';"
            class="card-img-top" alt="default map icon">
            <div class="card-body">
                <h6 class="card-title">${mapName}</h6>
                <p class="card-text text-muted"><small>Last Edit: ${lastUpdate}</small></p>
                <a href="map.html?mapid=${mtMap.mapId}" class="btn btn-primary">Open</a>
            </div>
        </div>
    </div>
  `;
  return htmlStr;
}


/* ========================= Helper Functions ========================= */
function readCookie(cookieName) {
  var allcookies = document.cookie;
  // Get all the cookies pairs in an array
  cookiearray = allcookies.split(';');

  // Now take key value pair out of this array
  for (var i = 0; i < cookiearray.length; i++) {
    let tempCookieName = cookiearray[i].split('=')[0];
    let tempCookieValue = cookiearray[i].split('=')[1];
    if (cookieName == tempCookieName.trim()) {
      return tempCookieValue.trim();
    }
  }
  return '';
}

function sendMtRequest(method, directory, requestBody, callback) {
  let req = new XMLHttpRequest();

  req.onreadystatechange = () => {
    if (req.readyState == XMLHttpRequest.DONE) {
      if (callback) {
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