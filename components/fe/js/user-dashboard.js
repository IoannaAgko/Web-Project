let userLat;
let userLon;

navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationError);
let map;
let tiles;
let layerGroup = null;
let userMarker;
function onLocationSuccess(position) {
    userLat = position.coords.latitude;
    userLon = position.coords.longitude;
    map = L.map('map').setView([userLat, userLon], 13);

    tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        //attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    userMarker = L.marker([userLat, userLon],{title: "Your position"}).addTo(map);
    userMarker.bindPopup('You are here');
    const element = document.getElementById("loadanim");
    element.remove();
}

function onLocationError(position) {
    console.log("error")
}


let searchbar = document.getElementById('searchbar');
searchbar.addEventListener("input", async function(e){
    if (layerGroup != null) {
        layerGroup.clearLayers();
    }
    else {
        layerGroup = L.layerGroup().addTo(map);
    }
    let response = await fetch("/api/pois/search/" + searchbar.value + "?lon=" + userLon + "&lat=" + userLat,
    {
        method: "GET",
        credentials: "include"

    })
    const result = await response.json();
    const data = result.data;
    for( let x of data){
        let poiMarker = L.marker([x.lat, x.lon],{title : x.name,}).addTo(layerGroup);
        if(x.visitPercentage <= 32){
            poiMarker._icon.classList.add("nocrowd");
        }
        else if (x.visitPercentage <= 65 && x.visitPercentage > 32){
            poiMarker._icon.classList.add("mediumcrowd");
        }
        else {
            poiMarker._icon.classList.add("crowded");
        }
        if(x.averageNumberOfVisits == null){
            x.averageNumberOfVisits = '-';
        }
        let markerText = '<p>' + x.name + '<br />Crowd estimation: ' + x.visitPercentage + '% <br /> Average number of visitors : ' + x.averageNumberOfVisits + ' </p>'
        
        if(findMarkerDistance(userMarker,poiMarker)){
            let pid = "'" + x.pid + "'";
            let visitString = `<a href="#"  class="social_share_link" onclick="registervisit(` + pid +`)">Register your visit</a>`
            markerText = markerText + visitString;
        }
        poiMarker.bindPopup(markerText);
    }
  })

  function findMarkerDistance(userMark, poiMark){
    let userLatlng = userMark.getLatLng();
    let poiMarklng = poiMark.getLatLng();
    const distance = userLatlng.distanceTo(poiMarklng)/1000 //distance se xiliometra
    if (distance <= 0.02){//should be 0.02(20 metres to kilometers), change to greater values for test purposes
        return true
    }
    else {return false}
  }
  async function registervisit(ctx){
    if (window.confirm("Do you really want to register your visit?")) {
        const visitorsEstimation = window.prompt("If you want enter visitors estimation, else press cancel", "");
        let visitorNumber = Number(visitorsEstimation)
        if (isNaN(visitorNumber)){
            alert("Wrong input, visit not registered. Please try again")
        }
        else{
            if(visitorsEstimation.length == 0){ //if user did not give an estimation
                visitorNumber = null//because else null is transformed to 0 from Number()
            }
            let visitObj = {
                estimation: visitorNumber,
                pid: ctx
            }
            let response = await fetch("/api/users/visit",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(visitObj)
        
                })
                if(response.status == 200){
                    alert("Visit registered successfully")
                }

            
        }
      }
  }




