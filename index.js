const map = L.map('map').setView([21.13219986874396, -101.6856768646196], 13); //CREAR MAPA CENTRADO EN LEÓN
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map); //CAPA DE MAPA ILUSTRACION

const puntosLayer = L.layerGroup().addTo(map); //CAPA DE PUNTOS (ESCUELAS)
const puntosCluster = L.markerClusterGroup(); // cariable de cluster de puntos
const poligonosLayer = L.layerGroup().addTo(map); //CAPA DE POLIGONOS (COLONIAS)
let coloniasVisibles = false; //ESTADO DE VISIBILIDAD DE COLNIAS
let coloniaSeleccionada = null; //Ultima colonia selecicona
let escuelaSeleccionada = null; //Ultima escuela seleccionada
let poligonosGeoJSON = []; //   features cargados
let clusteringActivo = false;


function seleccionarTipo() {
    const tipo = document.getElementById('tipoEscuela').value;
    if (tipo === 'todas') {
        cargarTodosLosPuntos();
    } 
    else {
        cargarPuntos(tipo);
    }
}

function cargarPuntos(tipo){ //FUNCION PARA CARGAR ESCUELAS SEGUN EL TIPO DE ESCUELA
    fetch(`http://localhost:3000/puntos?tipo=${tipo}`) //Llamada a la api son el tipo de escuela
        .then(res => res.json()) //convertir respuesta a json
        .then(data => {
            puntosLayer.clearLayers(); //ELIMINAR PUNTOS ANTERIORES

            L.geoJSON(data, { //crear capa en Leaflet con la respuesta del servidor
                pointToLayer: (feature, latlng) => {
                    return L.marker(latlng, { icon: iconos[tipo] }); //agregar el marcador por cada punto
                },
                onEachFeature: (feature, layer) => {
                    layer.on('click', () => {
                        escuelaSeleccionada = feature; // ← Guarda la escuela clickeada
                        document.getElementById('infoNombre').textContent = feature.properties.nombre;
                        document.getElementById('infoCategoria').textContent = 'Nivel: ' + (feature.properties.categoria || tipo);
                        document.getElementById('infoAlumnos').textContent = '# de alumnos: ' + (feature.properties.alumnos || 'No especificado');
                        document.getElementById('infoArea').textContent = 'Área: ' + (feature.properties.area ? `${feature.properties.area} m²` : 'No especificada');
                        document.getElementById('infoElevacion').textContent = 'Elevación: ' + (feature.properties.elevacion ? `${feature.properties.elevacion} msnm` : 'No especificada');
                        document.getElementById('infoPanel').style.display = 'block';
                    });
                }
            }).addTo(puntosLayer); //agregar la capa al grupo de puntosLayer
        });
}

function cargarTodosLosPuntos(usandoClustering = false) {
    fetch(`http://localhost:3000/puntos`)
        .then(res => res.json())
        .then(data => {
            puntosLayer.clearLayers();
            puntosCluster.clearLayers();

            const capaGeoJSON = L.geoJSON(data, {
                pointToLayer: (feature, latlng) => {
                    const tipo = feature.properties.categoria;
                    const icono = iconos[tipo] || L.Icon.Default;
                    return L.marker(latlng, { icon: icono });
                },
                onEachFeature: (feature, layer) => {
                    layer.on('click', () => {
                        escuelaSeleccionada = feature;
                        document.getElementById('infoNombre').textContent = feature.properties.nombre;
                        document.getElementById('infoCategoria').textContent = 'Nivel: ' + (feature.properties.categoria || 'No especificada');
                        document.getElementById('infoAlumnos').textContent = '# de alumnos: ' + (feature.properties.alumnos || 'No especificado');
                        document.getElementById('infoArea').textContent = 'Área: ' + (feature.properties.area ? `${feature.properties.area} m²` : 'No especificada');
                        document.getElementById('infoElevacion').textContent = 'Elevación: ' + (feature.properties.elevacion ? `${feature.properties.elevacion} msnm` : 'No especificada');
                        document.getElementById('infoPanel').style.display = 'block';
                    });
                }
            });

            if (usandoClustering) {
                puntosCluster.addLayer(capaGeoJSON);
                puntosLayer.addLayer(puntosCluster);
            } else {
                puntosLayer.addLayer(capaGeoJSON);
            }
        });
}



function cargarPoligonos() {
    if (coloniasVisibles) {
        poligonosLayer.clearLayers(); // Ocultar colonias
        coloniasVisibles = false;
    } 
    else {
        fetch('http://localhost:3000/poligonos')
            .then(res => res.json())
            .then(data => {
                poligonosGeoJSON = data.features; // Guardamos las features para usarlas después
                console.log(data);
                L.geoJSON(data, {
                    style: feature => ({
                        color: feature.properties.color,
                        fillColor: feature.properties.color,
                        fillOpacity: 0.4,
                        weight: 2
                    }),
                onEachFeature: (feature, layer) => {
                    layer.on('click', () => {
                        coloniaSeleccionada = feature; 
                        document.getElementById('infoNombre').textContent = feature.properties.nombre;
                        document.getElementById('infoCategoria').textContent = ''; // Vacío
                        document.getElementById('infoAlumnos').textContent = '';   // Vacío
                        document.getElementById('infoArea').textContent = 'Área: ' + (feature.properties.area ? `${parseFloat(feature.properties.area).toLocaleString()} m²` : 'No especificada');
                        document.getElementById('infoElevacion').textContent = ''; // Vacío                        
                        document.getElementById('infoPanel').style.display = 'block';
                    });
                }
                }).addTo(poligonosLayer);
                coloniasVisibles = true;
            });
    }
}

//Iconos para cada tipo de escuela
const iconos = {
    Primaria: L.icon({
        iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/blue.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -30]
    }),
    Secundaria: L.icon({
        iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/green.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -30]
    }),
    Preparatoria: L.icon({
        iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/yellow.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -30]
    }),
    Universidad: L.icon({
        iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/red.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -30]
    })
};

function cerrarInfo() {
    document.getElementById('infoPanel').style.display = 'none';
}


//SACAR UBICACION DEL USUARIO
function mostrarMiUbicacion() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        const iconoUsuario = L.icon({
          iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/man.png',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -30]
        });

        const marcadorUsuario = L.marker([lat, lon], { icon: iconoUsuario }).addTo(map);
        marcadorUsuario.bindPopup("Estás aquí").openPopup();

      },
      function (error) {
        console.error("No se pudo obtener la ubicación:", error);
        alert("No se pudo obtener tu ubicación.");
      }
    );
  } else {
    alert("Tu navegador no soporta geolocalización.");
  }
}

// FUNCION PARA CALCULAR DISTANCIA DE ESCUELA HASTA UBIVAVION
function calcularDistanciaCasa() {
  if (!escuelaSeleccionada) {
    alert("Primero selecciona una escuela.");
    return;
  }

  if (!navigator.geolocation) {
    alert("Tu navegador no soporta geolocalización.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    position => {
      const userPoint = turf.point([position.coords.longitude, position.coords.latitude]);
      const escuelaPoint = turf.point(escuelaSeleccionada.geometry.coordinates);

      const distancia = turf.distance(userPoint, escuelaPoint, { units: 'kilometers' });

      document.getElementById('infoDistancia').textContent = `Distancia desde tu ubicación: ${distancia.toFixed(2)} km`;
    },
    error => {
      console.error(error);
      document.getElementById('infoDistancia').textContent = 'No se pudo obtener tu ubicación.';
    }
  );
}

function resaltarIntersecciones() {
    if (poligonosGeoJSON.length === 0) {
        alert("Primero debes cargar las colonias.");
        return;
    }

    for (let i = 0; i < poligonosGeoJSON.length; i++) {
        for (let j = i + 1; j < poligonosGeoJSON.length; j++) {
            const featureA = poligonosGeoJSON[i];
            const featureB = poligonosGeoJSON[j];

            const interseccion = turf.intersect(featureA, featureB);

            if (interseccion) {
                console.log(`Intersección entre ${featureA.properties.nombre} y ${featureB.properties.nombre}`);
                L.geoJSON(interseccion, {
                    style: {
                        color: '#ff0000',
                        weight: 2,
                        fillColor: '#ff0000',
                        fillOpacity: 0.6
                    }
                }).addTo(map);
            }
        }
    }
}

function toggleClustering(btn) {
    clusteringActivo = !clusteringActivo;

    puntosLayer.clearLayers(); // Limpia todo
    puntosCluster.clearLayers(); // También limpia el cluster

    cargarTodosLosPuntos(clusteringActivo);

    btn.textContent = clusteringActivo ? 'Desactivar clustering' : 'Activar clustering';
}


//FUNCION DE CONTAR ESCUELAS EN UNA COLONIA
function contarEscuelasEnColonia() {
    if (!coloniaSeleccionada) {
        alert("Primero selecciona una colonia.");
        return;
    }

    const coloniaPolygon = turf.polygon(coloniaSeleccionada.geometry.coordinates);

    let contador = 0;

    fetch('http://localhost:3000/puntos')
        .then(res => res.json())
        .then(data => {
            const escuelas = data.features; // 👈 Asegúrate de acceder a .features

            escuelas.forEach(escuela => {
                const escuelaPoint = turf.point(escuela.geometry.coordinates);
                if (turf.booleanPointInPolygon(escuelaPoint, coloniaPolygon)) {
                    contador++;
                }
            });

            document.getElementById('infoCantEscuelas').textContent = `Escuelas en el área: ${contador}`;
        })
        .catch(err => {
            console.error("Error al obtener los datos de las escuelas:", err);
        });
}


function contarEscuelasEnRadio() {
    if (!escuelaSeleccionada) {
        alert("Primero selecciona una escuela.");
        return;
    }

    const centro = turf.point(escuelaSeleccionada.geometry.coordinates);
    const radio = 0.5; // 0.5 km = 500 metros
    const circuloBuffer = turf.buffer(centro, radio, { units: 'kilometers' });

    fetch('http://localhost:3000/puntos')
        .then(res => res.json())
        .then(data => {
            const escuelas = data.features;
            let contador = 0;

            escuelas.forEach(escuela => {
                const punto = turf.point(escuela.geometry.coordinates);
                if (turf.booleanPointInPolygon(punto, circuloBuffer)) {
                    contador++;
                }
            });

            document.getElementById('infoEscuelas500').textContent = `Escuelas en 500m: ${contador}`;
            
            // Opcional: dibujar el círculo en el mapa
            L.geoJSON(circuloBuffer, {
                style: {
                    color: 'red',
                    fillColor: 'red',
                    fillOpacity: 0.1,
                    weight: 2
                }
            }).addTo(map);
        })
        .catch(err => {
            console.error("Error al obtener los datos de las escuelas:", err);
        });
}

