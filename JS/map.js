'use strict';

//-----------------------------FILTERS-----------------------------------//

/*Slider*/
let slider = document.getElementById('slider_id');
let output = document.getElementById('value');

output.innerHTML = slider.value;
slider.oninput = function() {
  output.innerHTML = this.value;
};

/*Checkboxes*/
const filterUl = document.getElementById('filter_ul');

fetch(
    `https://api.kierratys.info/materialtypes/?api_key=d77219adedf77de9a97e20d8bcbf436f354cc01d`).
    then(function(response) {
      return response.json();
    }).then(function(data) {
  console.log(data);
  for (let i = 0; i < data.results.length; i++) {
    filterUl.innerHTML += `<li><input type="checkbox" value="${data.results[i].code}"> ${data.results[i].name}</li>`;
  }
}).catch(function(error) {
  console.log(error);
});

//---------------------------SETTING UP THE MAP VIEW------------------------//

let myLocation = null;
const map = L.map('mapview');
const LayerGroup = L.featureGroup().addTo(map);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

function showMap(crd) {
  map.setView([crd.latitude, crd.longitude], 7);
}

function userLocation(pos) {
  myLocation = pos.coords;
  showMap(myLocation);
  addMarker(myLocation, 'Olen tässä');
}

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

navigator.geolocation.getCurrentPosition(userLocation, error);

function addMarker(crd, text) {
  L.marker([crd.latitude, crd.longitude]).
      addTo(map).
      bindPopup(text).
      openPopup();
}

//--------------------------FETCHING DATA FROM API---------------------------//
/*Search by city name*/

const search = document.getElementById('input');
const searchButton = document.getElementById('search_button');

searchButton.addEventListener('click', function() {
  searchCity()
});



function searchCity() {
  fetch(
      `https://api.kierratys.info/collectionspots/?api_key=8a6b510dcff18319e04b9863c027729b91b130d5&municipality=${search.value}`).
      then(function(response) {
        return response.json();
      }).then(function(data) {
    console.log(data);
  }).catch(function(error) {
    console.log(error);
  });
}
