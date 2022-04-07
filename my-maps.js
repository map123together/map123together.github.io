const baseUrl = 'https://1and2.xyz/'; // MT API Base URL
let guid = '';

verifyLogin();

// Init Button Functions
newMapBtnFunction();
logoutBtnFunction();
renameSaveBtnFunction();
deleteBtnFunction();
revokeTokenBtnFunction();
copyLinkBtnFunction();

/** ============================= Page Functions ================================== */
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
      window.location.href = 'index.html';
    } else {
      if (resposeJson.picture) {
        document.getElementById("mt-user-picture").src = resposeJson.picture;
      }

      if (resposeJson.uid) {
        guid = resposeJson.uid;
        initMyMaps(resposeJson.uid);
        clearTimeout(loginTimeout);
      }
    }
  };

  let redirectBack = () => {
    document.cookie = "gUserCredential=";
    window.location.href = "index.html";
  }

  let loginTimeout = setTimeout(redirectBack, 5000); // Wait for 5 seconds
  sendMtRequest(method, dir, reqBody, parseRes);
}

function initMyMaps(uid) {

  let method = 'POST';
  let dir = 'map/maps';
  let reqBody = {
    "uid": uid
  };

  let parseRes = (response) => {
    let myMaps = [];
    let resposeJson = JSON.parse(response);
    myMaps = resposeJson;
    if (myMaps.length >= 10) {
      document.getElementById("newMapCard").style.display = "none";
    }
    myMaps.forEach(mtMap => {
      document.getElementById('mapCardsRow').insertAdjacentHTML('beforeend', generateMapCard(mtMap));
    });

    // Rename-Btn
    let renameBtns = document.getElementsByClassName('rename-btn');
    for (let i = 0; i < renameBtns.length; i++) {
      renameBtns[i].addEventListener("click", function () {
        defineRenameBtn(this);
      });
    }

    // Sharing-Btn
    let sharingBtns = document.getElementsByClassName('sharing-btn');
    for (let i = 0; i < sharingBtns.length; i++) {
      sharingBtns[i].addEventListener("click", function () {
        defineSharingBtn(this);
      });
    }

    // Delete-Btn
    let deleteBtns = document.getElementsByClassName('delete-btn');
    for (let i = 0; i < deleteBtns.length; i++) {
      deleteBtns[i].addEventListener("click", function () {
        defineDeleteBtn(this);
      });
    }
  };

  sendMtRequest(method, dir, reqBody, parseRes);
}

function defineDeleteBtn(button) {
  let mapid = button.dataset.mapid;

  var deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'), {});
  deleteModal.show();

  let method = 'GET';
  let dir = 'map/id/' + mapid;

  let parseRes = (response) => {
    let mtMap = {};
    let resposeJson = JSON.parse(response);
    if (resposeJson[0]) {
      mtMap = resposeJson[0];
      let mapName = mtMap.name;
      document.getElementById("tobeDeletedMapName").innerText = mapName;
      document.getElementById("deleteMapBtn").dataset.mapid = mapid;
    }
  };

  sendMtRequest(method, dir, null, parseRes);
}

function deleteBtnFunction() {
  document.getElementById("deleteMapBtn").addEventListener("click", function () {

    let mapid = this.dataset.mapid;
    let method = 'POST';
    let dir = 'map/id/' + mapid + '/delete-map';
    let reqBody = {
      "uid": guid
    };

    let parseRes = (response) => {
      let resposeJson = JSON.parse(response);
      if (resposeJson) {
        window.location.reload();
      }
    };
    sendMtRequest(method, dir, reqBody, parseRes);
  });
}

function defineRenameBtn(button) {
  let mapid = button.dataset.mapid;
  var renameModal = new bootstrap.Modal(document.getElementById('renameModal'), {});
  renameModal.show();

  let method = 'GET';
  let dir = 'map/id/' + mapid;

  let parseRes = (response) => {
    let mtMap = {};
    let resposeJson = JSON.parse(response);
    if (resposeJson[0]) {
      mtMap = resposeJson[0];
      let mapName = mtMap.name;
      document.getElementById("currentMapName").value = mapName;
      document.getElementById("saveNameBtn").dataset.mapid = mapid;
    }
  };

  sendMtRequest(method, dir, null, parseRes);
}

function renameSaveBtnFunction() {
  document.getElementById("saveNameBtn").addEventListener("click", function () {
    let mapid = this.dataset.mapid;
    let mapName = document.getElementById("currentMapName").value;
    let method = 'POST';
    let dir = 'map/id/' + mapid + '/update-name';
    let reqBody = {
      "name": mapName
    };

    let parseRes = (response) => {
      let resposeJson = JSON.parse(response);
      if (resposeJson) {
        window.location.reload();
      }
    };
    sendMtRequest(method, dir, reqBody, parseRes);
  });
}

function defineSharingBtn(button) {
  let mapid = button.dataset.mapid;
  let sharingModal = new bootstrap.Modal(document.getElementById('sharingModal'), {});
  sharingModal.show();

  document.getElementById("revokeTokenBtn").dataset.mapid = mapid;

  let method = 'GET';
  fetchTime = new Date().getTime();
  let dir = 'map/id/' + mapid + '?lft=' + fetchTime;

  let parseRes = (response) => {
    let mtMap = {};
    let sharingToken = '';
    let resposeJson = JSON.parse(response);
    if (resposeJson[0]) {
      mtMap = resposeJson[0];
      sharingToken = mtMap.sharingToken;
      let sharableLink = window.location.host + '/map.html?mapid=' + mapid + '&token=' + sharingToken;
      document.getElementById("sharableLink").value = sharableLink;
    }
  };

  sendMtRequest(method, dir, null, parseRes);
}

function revokeTokenBtnFunction() {
  document.getElementById("revokeTokenBtn").addEventListener("click", function () {
    let mapid = this.dataset.mapid;
    let method = 'POST';
    let dir = 'map/id/' + mapid + '/revoke-token';
    let reqBody = {
      "uid": guid
    };

    let parseRes = (response) => {
      let resposeJson = JSON.parse(response);
      if (resposeJson) {
        window.location.reload();
      }
    };
    sendMtRequest(method, dir, reqBody, parseRes);
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

function newMapBtnFunction() {
  document.getElementById("newMapBtn").addEventListener("click", function () {

    let method = 'POST';
    let dir = 'map/new-map';
    let reqBody = {
      "uid": guid
    };

    let parseRes = (response) => {
      let resposeJson = JSON.parse(response);
      if (resposeJson) {
        let mapid = resposeJson.mapId;
        if (mapid) {
          window.location.href = "map.html?mapid=" + mapid;
        }
      }
    };
    sendMtRequest(method, dir, reqBody, parseRes);
  });
}

function generateMapCard(mtMap) {
  let lastUpdate = new Date(mtMap.last_mod_time).toLocaleString("en-US");
  let mapName = mtMap.name.substring(0, 20);
  let htmlStr = `
  <div class="col-auto">
        <div class="card" style="width: 12rem; margin-bottom: 1rem;">
            <img src="https://maps.googleapis.com/maps/api/staticmap?center=${mtMap.center.lat},${mtMap.center.lng}
            &zoom=${mtMap.zoom}&size=200x200&key=AIzaSyBwZQMrJr2VD6WUbIb-ljX8QD_BdfbY1c8" 
            onerror="event.target.src = 'new-map-icon.png';"
            class="card-img-top" alt="default map icon">
            <div class="card-body">
                <h6 class="card-title">${mapName}</h6>
                <p class="card-text text-muted"><small>${lastUpdate}</small></p>
                <div class="btn-group">
                  <a href="map.html?mapid=${mtMap.mapId}" class="btn btn-primary">Open</a>
                  <div class="dropdown">
                    <button class="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <i class="bi bi-three-dots"></i>
                    </button>
                    <ul class="dropdown-menu">
                    <li><button class="dropdown-item rename-btn" data-mapid="${mtMap.mapId}">
                        <i class="bi bi-input-cursor-text"></i> Rename
                          </button>
                      </li>
                      <li><button class="dropdown-item sharing-btn" data-mapid="${mtMap.mapId}">
                            <i class="bi bi-share"></i> Share
                          </button>
                      </li>
                      <li><hr class="dropdown-divider"></li>
                      <li><button class="dropdown-item text-danger delete-btn" data-mapid="${mtMap.mapId}">
                            <i class="bi bi-trash"></i> Delete
                          </button>
                      </li>
                    </ul>
                  </div>
                </div>
            </div>
        </div>
    </div>
  `; //<div class="col-xs-6 col-sm-4 col-md-4 col-lg-auto">
  return htmlStr;
}

function logoutBtnFunction() {
  document.getElementById("logoutBtn").addEventListener("click", function () {
    document.cookie = "gUserCredential=";
    window.location.href = "index.html";
  });
}