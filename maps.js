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
        <div class="card" style="width: 11rem; margin-bottom: 1rem;">
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
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots" viewBox="0 0 16 16">
                      <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                      </svg>
                    </button>
                    <ul class="dropdown-menu">
                      <li><button class="dropdown-item share-btn" data-mapid="${mtMap.mapId}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-share" viewBox="0 0 16 16">
                              <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
                            </svg> Share
                            </button>
                      </li>
                      <li><hr class="dropdown-divider"></li>
                      <li><button class="dropdown-item delete-btn" data-mapid="${mtMap.mapId}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                              <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                            </svg>
                            Delete</button>
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