'use strict';

//-----------------------------FILTERS-----------------------------------//
/*Checkboxes*/
const filterUl = document.getElementById('filter_ul');

fetch(
    `https://api.kierratys.info/materialtypes/?api_key=d77219adedf77de9a97e20d8bcbf436f354cc01d`).
    then(function(response) {
      return response.json();
    }).then(function(data) {
  for (let i = 0; i < data.results.length; i++) {
    filterUl.innerHTML += `<label class="container">${data.results[i].name}
  <input type="checkbox" checked="checked">
  <span class="checkmark"></span>
</label>`;
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
  map.setView([crd.latitude, crd.longitude], 10);
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

const searchInput = document.getElementById('input');
const searchButton = document.getElementById('search_button');

searchButton.addEventListener('click', function() {
  let searchByCity = `https://api.kierratys.info/collectionspots/?api_key=8a6b510dcff18319e04b9863c027729b91b130d5&municipality=${searchInput.value}`;
  search(searchByCity);
});

searchInput.addEventListener('keyup', function(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    searchButton.click();
  }
});

/*Search by distance*/

let slider = document.getElementById('slider_id');
let output = document.getElementById('value');
let filterButton = document.getElementById('filter_button');

output.innerHTML = slider.value;
slider.oninput = function() {
  output.innerHTML = this.value;
};

filterButton.addEventListener('click', function() {
  let searchByDistance = `https://api.kierratys.info/collectionspots/?api_key=8a6b510dcff18319e04b9863c027729b91b130d5&dist=${slider.value *
  1000}&point=${myLocation.longitude}, ${myLocation.latitude}`;
  search(searchByDistance);
});

function search(apiSearchUrl) {
  fetch(apiSearchUrl,
  ).
      then(function(response) {
        return response.json();
      }).then(function(data) {
    console.log(data);

    for (let i = 0; i < data.results.length; i++) {

      const coords = {
        longitude: data.results[i].geometry.coordinates[0],
        latitude: data.results[i].geometry.coordinates[1],
      };

      let recycleMaterial = [];
      for (let j = 0; j < data.results[i].materials.length; j++) {
        recycleMaterial += data.results[i].materials[j].name + '<br>';
        console.log(recycleMaterial);
      }

      let popupInfo = `<h5>${data.results[i].name}</h5>
                         <p>${data.results[i].address}<br>
                         ${data.results[i].postal_code}, ${data.results[i].post_office}
                         <h5>Kierrätettävät materiaalit: </h5>
                         ${recycleMaterial}</p>                                 
`;

      if (data.results[i].contact_info !== '') {
        popupInfo += `<h5>Yhteystiedot: </h5>
                      <p>${data.results[i].contact_info}</p>`;
      }

      addMarker(coords, popupInfo);
    }

  }).catch(function(error) {
    console.log(error);
  });
}
