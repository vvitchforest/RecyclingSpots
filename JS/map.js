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
  <input class="checkboxes" type="checkbox" checked="checked" value="${data.results[i].code}">
  <span class="checkmark"></span>
</label>`;
  }
}).catch(function(error) {
  console.log(error);
});

const checkAllBoxes = document.getElementById(`check_all`);

$(document).ready(function(){
  // Check or Uncheck All checkboxes
  $("#check_all").change(function(){
    let checked = $(this).is(':checked');
    if(checked){
      $(".checkboxes").each(function(){
        $(this).prop("checked",true);
      });
    }else{
      $(".checkboxes").each(function(){
        $(this).prop("checked",false);
      });
    }
  });

  // Changing state of CheckAll checkbox
  $(".checkboxes").click(function(){

    if($(".checkboxes").length === $(".checkboxes:checked").length) {
      $("#check_all").prop("checked", true);
    } else {
      $("#check_all").removeAttr("checked");
    }
  });
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
      addTo(LayerGroup).
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
  search(checkboxes(searchByDistance));
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
      }
      //console.log(recycleMaterial);
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

function checkboxes(apiURL) {
  const checkboxes = document.getElementsByClassName(`checkboxes`);
  for (let i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].checked === true && apiURL.includes('&material=')) {
      apiURL += `${checkboxes[i].value},`;
    } else if (checkboxes[i].checked === true) {
      apiURL += `&material=${checkboxes[i].value},`;
    }
  }
  if (apiURL.endsWith(',')) {
    apiURL = apiURL.substring(0, apiURL.length - 1);
  }
  console.log(apiURL);
  return apiURL;
}