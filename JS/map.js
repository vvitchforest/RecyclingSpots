'use strict';

//----------------------------BUTTONS--------------------------------------//

let searchButtonTop = document.getElementById('search_button_at_top');
let locateButton = document.getElementById('locate_button');
let distanceContainer = document.getElementById('distance_container');
let searchContainer = document.getElementById('search_container');
let filterButton = document.getElementById('filter_button');
let defaultMapview = `https://api.kierratys.info/collectionspots/?api_key=8a6b510dcff18319e04b9863c027729b91b130d5&dist=15000&point=24.9384, 60.1699`;


$(function() {
  $('.main_buttons').on(`hover`, function() {
    $(this).toggleClass('main_buttons:hover');
  });
  $(locateButton).on(`click`, function() {
    $(distanceContainer).css("display", "flex");
    $(searchContainer).hide();
    $(filterButton).show();
    $(locateButton).addClass('main_buttonsClicked');
    $(searchButtonTop).removeClass(`main_buttonsClicked`);
    markers.clearLayers();
    if (myLocation === null) {
      navigator.geolocation.getCurrentPosition(userLocation, error);
    } else {
      userMarker.addTo(map).openPopup();
      showMap(myLocation, 12);
    }
  });
  $(searchButtonTop).on(`click`, function() {
    $(searchContainer).show();
    $(distanceContainer).hide();
    $(filterButton).hide();
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
  const $checkAllBox = $(`#check_all`);
  $($checkAllBox).on(`click`, function() {
    $('input:checkbox').not(this).prop('checked', false);
  });
  $(`.checkboxes`).on(`click`, function() {
    $($checkAllBox).prop(`checked`, false);
    if ($(`input:checkbox:checked`).length === 0) {
      $(`#check_all`).prop(`checked`, true);
    }
  });
}).catch(function(error) {
  console.log(error);
});

//---------------------------SETTING UP THE MAP VIEW------------------------//
let myLocation = null;
let userMarker;
const startingView = {
  latitude: 60.3,
  longitude: 25,
};
let map = L.map('mapview');

const pinMarkerUser = L.divIcon({
  className: 'user_marker',

});

const pinMarkerIcon = L.divIcon({
  className: 'pin_marker',
  html: '<i class="fas fa-recycle"></i>',
});

const markers = L.markerClusterGroup({
  iconCreateFunction: function(cluster) {
    let childCount = cluster.getChildCount();
    let myCluster = 'custom_cluster_';
    let height = 0;
    let width = 0;
    if (childCount < 10) {
      myCluster += 'small';
      height = 30;
      width = 30;
    } else if (childCount < 100) {
      myCluster += 'medium';
      height = 50;
      width = 50;

    } else {
      myCluster += 'large';
      height = 70;
      width = 70;
    }

    return new L.DivIcon({
      html: '<span>' + childCount + '</span>',
      className: myCluster,
      iconSize: new L.Point(height, width),
    });

  },
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="httxps://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

showMap(startingView, 10);

function showMap(crd, zoom) {
  map.setView([crd.latitude, crd.longitude], zoom);
}

function userLocation(pos) {
  myLocation = pos.coords;
  userMarker = L.marker([myLocation.latitude, myLocation.longitude],
      {icon: pinMarkerUser});
  let userText = `<div id="userPopUp">Olen tässä</div>`
  userMarker.
      addTo(map).
      bindPopup(userText);
}

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

function addMarker(crd, text, icon) {
  let marker = L.marker([crd.latitude, crd.longitude], {icon: icon}).
      bindPopup(text);
  markers.addLayer(marker);

}

search(checkboxes(defaultMapview));

//--------------------------FETCHING DATA FROM API---------------------------//
/*Search by city name*/

const searchInput = document.getElementById('input');
const searchButton = document.getElementById('search_button');

searchButton.addEventListener('click', function() {
  let searchByCity = `https://api.kierratys.info/collectionspots/?api_key=8a6b510dcff18319e04b9863c027729b91b130d5&municipality=${searchInput.value}`;
  markers.clearLayers();
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
output.innerHTML = slider.value;
slider.oninput = function() {
  output.innerHTML = this.value;
};

filterButton.addEventListener('click', function() {
  markers.clearLayers();
  let searchByDistance = `https://api.kierratys.info/collectionspots/?api_key=8a6b510dcff18319e04b9863c027729b91b130d5&dist=${slider.value *
  1000}&point=${myLocation.longitude}, ${myLocation.latitude}`;
  search(checkboxes(searchByDistance));
});

function search(apiSearchUrl) {
  if ($('#filter_ul :checkbox:checked').length === 0) {
    alert('Valitse ainakin yksi kierrätettävä materiaali');
  } else {
    $('.loader').show();
    $('#mapview').fadeTo('fast', 0.6);
    fetch(apiSearchUrl).then(function(response) {
      return response.json();
    }).then(function(data) {
      console.log(data);
      handleData(data);
      if (data.next !== null && data.next !== ``) {
        search(`https://cors-anywhere.herokuapp.com/${data.next}`);
      } else if (data.next === null) {
        $('#mapview').fadeTo('slow', 1);
        $('.loader').hide();
        map.flyToBounds(markers.getBounds());
      }
    }).
        catch(function(error) {
          console.log(error);
        });
    map.addLayer(markers);
  }
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
  return apiURL;
}

function handleData(data) {
  for (let i = 0; i < data.results.length; i++) {
    if (data.results[i].geometry !== null) {
      const coords = {
        longitude: data.results[i].geometry.coordinates[0],
        latitude: data.results[i].geometry.coordinates[1],
      };

      let recycleMaterial = [];
      for (let j = 0; j < data.results[i].materials.length; j++) {
        recycleMaterial += '<li class="material_list_item" style="list-style: none"><i class="fas fa-recycle"></i>&nbsp &nbsp' +
            data.results[i].materials[j].name + '</li>';
      }
      let popupInfo = `<div class="popup_info"><h3>${data.results[i].name}</h3>
                         <p>${data.results[i].address}<br>
                         ${data.results[i].postal_code}, ${data.results[i].post_office}
                         <h4>Kierrätettävät materiaalit </h4>
                        <ul class="material_list"> ${recycleMaterial}</ul></p>                            
`;

      if (data.results[i].contact_info !== '') {
        popupInfo += `<h4>Yhteystiedot </h4>
                      <p>${data.results[i].contact_info}</p></div>`;
      } else {
        popupInfo += `</div>`;
      }
      if (i === 0) {
        if (data.results[i + 1].geometry !== null) {
          const nextCoords = {
            longitude: data.results[i + 1].geometry.coordinates[0],
            latitude: data.results[i + 1].geometry.coordinates[1],
          };
          if (getDistance(coords, nextCoords) < 60000) {
            addMarker(coords, popupInfo, pinMarkerIcon);
          }
        }
      } else {
        if (data.results[i - 1].geometry !== null) {
          const previousCoords = {
            longitude: data.results[i - 1].geometry.coordinates[0],
            latitude: data.results[i - 1].geometry.coordinates[1],
          };
          if (getDistance(coords, previousCoords) < 60000 &&
              getDistance(coords, previousCoords) !== 0) {
            addMarker(coords, popupInfo, pinMarkerIcon);
          }
        }
      }
    }
  }
}

//Takes two geographical coordinate locations and calculates the distance between them. Returns meters
function getDistance(coords, secondCoords) {
  let lon1 = toRadian(coords.longitude),
      lat1 = toRadian(coords.latitude),
      lon2 = toRadian(secondCoords.longitude),
      lat2 = toRadian(secondCoords.latitude);

  let deltaLat = lat2 - lat1;
  let deltaLon = lon2 - lon1;

  let a = Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(lat1) *
      Math.cos(lat2) * Math.pow(Math.sin(deltaLon / 2), 2);
  let c = 2 * Math.asin(Math.sqrt(a));
  let EARTH_RADIUS = 6371;
  return c * EARTH_RADIUS * 1000;

}

//Converts degrees to radians
function toRadian(degree) {
  return degree * Math.PI / 180;
}