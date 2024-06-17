let map;
let routeControl;
let origemMarker;
let destinoCircle;

function initMap() {
  map = L.map('map').setView([-23.5505, -46.6333], 13); // Inicializa o mapa com centro em São Paulo e zoom 13
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
}

function buscarRota() {
  let enderecoOrigem = document.getElementById("enderecoOrigem").value;
  let enderecoDestino = document.getElementById("enderecoDestino").value;

  if (!enderecoOrigem || !enderecoDestino) {
    alert("Por favor, digite o endereço de origem e o endereço de destino.");
    return;
  }

  buscarCoordenadas(enderecoOrigem, function(coordOrigem) {
    buscarCoordenadas(enderecoDestino, function(coordDestino) {
      if (coordOrigem && coordDestino) {
        let url = `https://router.project-osrm.org/route/v1/driving/${coordOrigem[1]},${coordOrigem[0]};${coordDestino[1]},${coordDestino[0]}?overview=full&geometries=geojson`;

        fetch(url)
          .then(response => response.json())
          .then(data => {
            if (routeControl) {
              map.removeControl(routeControl);
            }

            let route = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
            routeControl = L.polyline(route, {color: 'blue'}).addTo(map);

            map.fitBounds(routeControl.getBounds());

            // Adicionar marcadores e balões de mensagem
            adicionarMarcadores(coordOrigem, coordDestino);
          })
          .catch(error => {
            console.error('Erro ao buscar rota:', error);
            alert("Erro ao buscar rota. Verifique a conexão ou tente novamente mais tarde.");
          });
      } else {
        alert("Endereço não encontrado.");
      }
    });
  });
}

function adicionarMarcadores(coordOrigem, coordDestino) {
  // Remover marcadores antigos, se existirem
  if (origemMarker) {
    map.removeLayer(origemMarker);
  }
  if (destinoCircle) {
    map.removeLayer(destinoCircle);
  }

  // Adicionar marcador de origem
  origemMarker = L.marker(coordOrigem).addTo(map);
  origemMarker.bindPopup('<b>Você está aqui</b>').openPopup();

  // Adicionar círculo de destino
  destinoCircle = L.circle(coordDestino, {
    color: 'orange',
    fillColor: 'orange',
    fillOpacity: 0.5,
    radius: 100 // Raio do círculo em metros (ajuste conforme necessário)
  }).addTo(map);
  destinoCircle.bindPopup('<b>Seu destino</b>').openPopup();
}

function resetarMapa() {
  document.getElementById("enderecoOrigem").value = "";
  document.getElementById("enderecoDestino").value = "";
  
  if (routeControl) {
    map.removeControl(routeControl);
  }
  if (origemMarker) {
    map.removeLayer(origemMarker);
    origemMarker = null;
  }
  if (destinoCircle) {
    map.removeLayer(destinoCircle);
    destinoCircle = null;
  }
}

function buscarCoordenadas(endereco, callback) {
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${endereco}`)
    .then(response => response.json())
    .then(data => {
      if (data && data.length > 0) {
        let lat = parseFloat(data[0].lat);
        let lon = parseFloat(data[0].lon);
        callback([lat, lon]);
      } else {
        callback(null);
      }
    })
    .catch(error => {
      console.error('Erro ao buscar endereço:', error);
      alert("Erro ao buscar endereço. Verifique a conexão ou tente novamente mais tarde.");
      callback(null);
    });
}

// Chama a função initMap após o carregamento da página
document.addEventListener("DOMContentLoaded", function() {
  initMap();
});

