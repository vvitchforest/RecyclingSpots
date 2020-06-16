'use strict';

//---------------------------SETTING UP THE MAP VIEW------------------------//

let myLocation = null;
const map = L.map('mapview');
const LayerGroup = L.featureGroup().addTo(map);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

function showMap(crd) {
  map.setView([crd.latitude, crd.longitude], 8);
}

function userLocation(pos) {
  myLocation = pos.coords;
  showMap(myLocation);
}

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

navigator.geolocation.getCurrentPosition(userLocation, error);

//--------------------------FETCHING DATA FROM API---------------------------//