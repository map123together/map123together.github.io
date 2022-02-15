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

    if (!resposeJson || !resposeJson.verified) {
      window.location.href = 'index.html';
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
  <div class="col-auto">
        <div class="card" style="width: 15rem; margin-bottom: 1rem;">
            <img src="https://maps.googleapis.com/maps/api/staticmap?center=${mtMap.center.lat},${mtMap.center.lng}
            &zoom=${mtMap.zoom}&size=200x200&key=AIzaSyBwZQMrJr2VD6WUbIb-ljX8QD_BdfbY1c8" 
            onerror="event.target.src = 'new-map-icon.png';"
            class="card-img-top" alt="default map icon">
            <div class="card-body">
                <h6 class="card-title">${mapName}</h6>
                <p class="card-text text-muted"><small>Last Edit: ${lastUpdate}</small></p>
                <div class="btn-group">
                  <a href="map.html?mapid=${mtMap.mapId}" class="btn btn-primary">Open</a>
                  <div class="dropdown">
                    <button class="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <i class="bi bi-three-dots"></i>
                    </button>
                    <ul class="dropdown-menu">
                      <li><button class="dropdown-item share-btn" data-mapid="${mtMap.mapId}">
                            <i class="bi bi-share"></i> Share
                          </button>
                      </li>
                      <li><hr class="dropdown-divider"></li>
                      <li><button class="dropdown-item text-danger" data-mapid="${mtMap.mapId}">
                            <i class="bi bi-trash"></i> Delete
                          </button>
                      </li>
                    </ul>
                  </div>
                </div>
            </div>
        </div>
    </div>
  `;//<div class="col-xs-6 col-sm-4 col-md-4 col-lg-auto">
  return htmlStr;
}