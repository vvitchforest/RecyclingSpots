'use strict';

//----------------------------BUTTONS--------------------------------------//

let searchButtonTop = document.getElementById('search_button_at_top');
let locateButton = document.getElementById('locate_button');
let distanceContainer = document.getElementById('distance_container');
let searchContainer = document.getElementById('search_container');

$(function() {
  $('.main_buttons').on(`hover`, function() {
    $(this).toggleClass('main_buttons:hover');
  });
  $(locateButton).on(`click`, function() {
    $(distanceContainer).show();
    $(searchContainer).hide();
    $(locateButton).addClass('main_buttonsClicked');
    $(searchButtonTop).removeClass(`main_buttonsClicked`);
    if (myLocation === null) {
      navigator.geolocation.getCurrentPosition(userLocation, error);
    } else {
      userMarker.addTo(map).openPopup();
    }
  });
  $(searchButtonTop).on(`click`, function() {
    $(searchContainer).show();
    $(distanceContainer).hide();
    $(searchButtonTop).addClass('main_buttonsClicked');
    $(locateButton).removeClass(`main_buttonsClicked`);
    if (myLocation !== null) {
      map.removeLayer(userMarker);
    }
  });
});
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
  <input class="checkboxes" type="checkbox" value="${data.results[i].code}">
  <span class="checkmark"></span>
</label>`;
  }

  $('#check_all').on(`click`, function() {
    $('input:checkbox').not(this).prop('checked', false);
  });

  $(`.checkboxes`).on(`click`, function() {
    $(`#check_all`).prop(`checked`, false);
  });

}).catch(function(error) {
  console.log(error);
});

//---------------------------SETTING UP THE MAP VIEW------------------------//

let markerCount = 0;
let myLocation = null;
let userMarker;
const startingView = {
  latitude: 60.3,
  longitude: 25,
};
let map = L.map('mapview');
const LayerGroup = L.featureGroup().addTo(map);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

showMap(startingView);

function showMap(crd) {
  map.setView([crd.latitude, crd.longitude], 10);
}

function userLocation(pos) {
  myLocation = pos.coords;
  showMap(myLocation);
  userMarker = L.marker([myLocation.latitude, myLocation.longitude]);
  userMarker.
      addTo(map).
      bindPopup('Olen tässä').
      openPopup();
}

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

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
  search(checkboxes(searchByCity));
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

/*filterButton.addEventListener('click', function() {
  let searchByDistance = `https://api.kierratys.info/collectionspots/?api_key=8a6b510dcff18319e04b9863c027729b91b130d5&dist=${slider.value *
  1000}&point=${myLocation.longitude}, ${myLocation.latitude}`;
  search(checkboxes(searchByDistance));
}); */

function search(apiSearchUrl) {
  if ($('#filter_ul :checkbox:checked').length === 0) {
    alert('Valitse ainakin yksi kierrätettävä materiaali');
  } else {
    LayerGroup.clearLayers();
      fetch(apiSearchUrl,
      ).
          then(function(response) {
            return response.json();
          }).then(function(data) {
        console.log(data);
        for (let i = 0; i < data.results.length; i++) {
          if (data.results[i].geometry === null) {
            console.log(
                data.results[i].name + ': koordinaatit eivät ole saatavilla');
          } else {
            const coords = {
              longitude: data.results[i].geometry.coordinates[0],
              latitude: data.results[i].geometry.coordinates[1],
            };
            let recycleMaterial = [];
            for (let j = 0; j < data.results[i].materials.length; j++) {
              recycleMaterial += data.results[i].materials[j].name + '<br>';
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
            markerCount++;
          }
        }
        console.log(markerCount);
      }).catch(function(error) {
        console.log(error);
      });
    }
    map.flyToBounds(LayerGroup.getBounds());

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