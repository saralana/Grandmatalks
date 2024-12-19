var transformRequest = (url, resourceType) => {
    var isMapboxRequest =
      url.slice(8, 22) === "api.mapbox.com" ||
      url.slice(10, 26) === "tiles.mapbox.com";
    return {
      url: isMapboxRequest
        ? url.replace("?", "?pluginName=sheetMapper&")
        : url
    };
};

mapboxgl.accessToken = 'pk.eyJ1Ijoic2FyYWxnYyIsImEiOiJja2NjbTAyczkwNXA3Mnlscm5nbjN5OHZiIn0.yNcJkPBSugRlIeGkXDRlZw'; //Mapbox token 

var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/saralgc/cm2a6zb0h004f01pcfr88fj23',
    center: [-30, 20], // starting position
    zoom: 2.4, // starting zoom
    minZoom: 2,
    maxZoom: 20
});



// Função para gerar pontos intermediários ao longo de um arco

function interpolateArc(start, end, numPoints) {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const toDeg = (rad) => (rad * 180) / Math.PI;

    const lat1 = toRad(start[1]);
    const lon1 = toRad(start[0]);
    const lat2 = toRad(end[1]);
    const lon2 = toRad(end[0]);

    const d = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin((lat2 - lat1) / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lon2 - lon1) / 2), 2)));

    const points = [];

    for (let i = 0; i <= numPoints; i++) {
        const f = i / numPoints;
        const A = Math.sin((1 - f) * d) / Math.sin(d);
        const B = Math.sin(f * d) / Math.sin(d);

        const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
        const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
        const z = A * Math.sin(lat1) + B * Math.sin(lat2);

        const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
        const lon = Math.atan2(y, x);

        points.push([toDeg(lon), toDeg(lat)]);
    }
    return points;
}



// Esperar até o carregamento completo do mapa

map.on('load', () => {
   
    $(document).ready(function () {        
        $.ajax({
            type: "GET",
            url: 'https://docs.google.com/spreadsheets/d/1DCAUiy3GIoZTE5kUpIGXrIIUeIbGJZ7e9TsybO0A88M/gviz/tq?tqx=out:csv&sheet=episodes',
            //url: 'assets/episodes.csv',
            dataType: "text",
            success: function (csvData) { makeGeoJSON3(csvData); }
        });

        $.ajax({
            type: "GET",
            //url: 'https://docs.google.com/spreadsheets/d/...MNf0/gviz/tq?tqx=out:csv&sheet=videos',
            url: 'assets/videos.csv',
            dataType: "text",
            success: function (csvData) { makeGeoJSON(csvData); }
        });
            
        $.ajax({
            type: "GET",
            //url: 'https://docs.google.com/spreadsheets/d/...MNf0/gviz/tq?tqx=out:csv&sheet=memos',
            url: 'assets/memos.csv',
            dataType: "text",
            success: function (csvData) { makeGeoJSON2(csvData); }
        });

    });
// MEMOS LAYER
    
function makeGeoJSON2(csvData) {
    csv2geojson.csv2geojson(csvData, {
      latfield: 'Latitude',
      lonfield: 'Longitude',
      delimiter: ','
    }, function (err, data) {

        map.loadImage('assets/icon_b1.png',
          function(error, image){
          if (error) throw error;
          map.addImage('memo_icon', image);
          }
        );

        // LAYER MARKERS
        map.addLayer({
          'id': 'memos',
          'type': 'symbol',
          'source': {
            'type': 'geojson',
            'data': data
          },
          'layout': {
            'visibility': 'visible',
            'icon-image': 'memo_icon',
            'icon-anchor': 'bottom',
            "icon-allow-overlap": true,
          }
        });  
        
        map.on('click', 'memos', function (e) {
            var coordinates = e.features[0].geometry.coordinates.slice();
            var lng = coordinates[0];
            var lat = coordinates[1];
            var lng2 = e.features[0].properties.Longitude2;
            var lat2 = e.features[0].properties.Latitude2;

            //var description = `<iframe width="100%" height="20" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/`+e.features[0].properties.Embed +`&color=%23F6AE2D&inverse=false&auto_play=false&show_user=false"></iframe>`;
            //var description = '<audio controls style="width:100%;" controlsList="nodownload" autoplay><source src="../assets/sounds/' + e.features[0].properties.Som + '.mp3" type="audio/mpeg"></audio>';
            var description = `<h2>` + lat + `<br>`  + lng + `<br>` + e.features[0].properties.Latitude2 + `<br>`  + e.features[0].properties.Longitude2 +`</h2>`;

            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            //only one popup once 
            e.originalEvent.cancelBubble2 = true;
            
            if (e.originalEvent.cancelBubble || e.originalEvent.cancelBubble3 || e.originalEvent.cancelBubble4) {
                return;
            }

            new mapboxgl.Popup({closeButton: false, className: 'popupSom'})
              .setLngLat(coordinates)
              .setHTML(description)
              .addTo(map);
        });          

        map.on('mouseenter', 'memos', function () {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'memos', function () {
          map.getCanvas().style.cursor = '';
        });
        map.setLayoutProperty('memos', 'icon-size', 
            ['interpolate', ['linear'], ['zoom'],0,0.04,20,0.20]);
      // });
      }).catch((error) => {
        console.error(error);
      });
};    
////

// VIDEOS LAYER

function makeGeoJSON(csvData) {
    csv2geojson.csv2geojson(csvData, {
      latfield: 'Latitude',
      lonfield: 'Longitude',
      delimiter: ','
    }, function (err, data) {

      map.loadImage('assets/icon_b3.png',
          function(error, image){
          if (error) throw error;
          map.addImage('video_icon', image);
          }
      );

        // LAYER
        map.addLayer({
          'id': 'videos',
          'type': 'symbol',
          'source': {
            'type': 'geojson',
            'data': data
          },

          'layout': {
            'visibility': 'visible',
            'icon-image': 'video_icon',
            'icon-anchor': 'bottom',
            "icon-allow-overlap": true,
          }

        });        

        /*map.on('click', 'videos', function (e) {
            var coordinates = e.features[0].geometry.coordinates.slice();

            //var description = `<iframe width="100%" height="20" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/`+e.features[0].properties.Embed +`&color=%23F6AE2D&inverse=false&auto_play=false&show_user=false"></iframe>`;
            var description = '<audio controls style="width:100%;" controlsList="nodownload" autoplay><source src="../assets/sounds/' + e.features[0].properties.Som + '.mp3" type="audio/mpeg"></audio>';
            //var description = `<h2>`+e.features[0].properties.Som +`</h2>`;

            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            //only one popup once 
            e.originalEvent.cancelBubble2 = true;
            
            if (e.originalEvent.cancelBubble || e.originalEvent.cancelBubble3 || e.originalEvent.cancelBubble4) {
                return;
            }

            new mapboxgl.Popup({closeButton: false, className: 'popupSom'})
              .setLngLat(coordinates)
              .setHTML(description)
              .addTo(map);
        });
        */          

        map.on('mouseenter', 'videos', function () {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'vidos', function () {
          map.getCanvas().style.cursor = '';
        });
        map.setLayoutProperty('videos', 'icon-size', 
            ['interpolate', ['linear'], ['zoom'],0,0.04,20,0.20]);
      // });
      }).catch((error) => {
        console.error(error);
      });
};    
////


  // EPISODES LAYER


  function makeGeoJSON3(csvData) {

    csv2geojson.csv2geojson(csvData, {
      latfield: 'Latitude',
      lonfield: 'Longitude',
      delimiter: ','
    }, function (err, data) {

      map.loadImage('assets/icon_b2.png',
          function(error, image){
          if (error) throw error;
          map.addImage('episode_icon', image);
          }
      );


        // LAYER EPISODES
        map.addLayer({
          'id': 'episodes',
          'type': 'symbol',
          'source': {
            'type': 'geojson',
            'data': data
          },

          'layout': {
            'visibility': 'visible',
            'icon-image': 'episode_icon',
            'icon-anchor': 'bottom',
            "icon-allow-overlap": true,
          }

        });       
/*
        map.on('click', 'episodes', function (e) {
            var coordinates = e.features[0].geometry.coordinates.slice();
            var lng = coordinates[0];
            var lat = coordinates[1];
            var lng2 = parseFloat(e.features[0].properties.Longitude2);
            var lat2 = parseFloat(e.features[0].properties.Latitude2);
            var routeId = e.features[0].properties.id;

            //var description = `<iframe width="100%" height="20" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/`+e.features[0].properties.Embed +`&color=%23F6AE2D&inverse=false&auto_play=false&show_user=false"></iframe>`;
            //var description = '<audio controls style="width:100%;" controlsList="nodownload" autoplay><source src="../assets/sounds/' + e.features[0].properties.Som + '.mp3" type="audio/mpeg"></audio>';
            var description = `<h2>` + e.features[0].properties.title + `</h2>` + `<p>` + e.features[0].properties.locations + `</p>` + `<img src="` + e.features[0].properties.image + `">` + `<br>`  + lng2 + routeId + `</h2>`;

            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }
                            
            //only one popup once 
            e.originalEvent.cancelBubble2 = true;
            
            if (e.originalEvent.cancelBubble || e.originalEvent.cancelBubble3 || e.originalEvent.cancelBubble4) {
                return;
            }

            new mapboxgl.Popup({closeButton: false, className: 'popupSom'})
              .setLngLat(coordinates)
              .setHTML(description)
              .addTo(map);

              map.addSource(routeId, {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': [
                            [lng, lat],
                            [lng2, lat2]
                        ]
                    }
                }
                });
        
                map.addLayer({
                        'id': routeId,
                        'type': 'line',
                        'source': routeId,
                        'layout': {
                            'line-join': 'round',
                            'line-cap': 'round'
                        },
                        'paint': {
                            'line-color': 'black',
                            'line-width': 8
                        }
                });            
        });   
        
        */

        map.on('click', 'episodes', function (e) {

            const coordinates = e.features[0].geometry.coordinates.slice();
            const lng = coordinates[0];
            const lat = coordinates[1];
            const lng2 = parseFloat(e.features[0].properties.Longitude2);
            const lat2 = parseFloat(e.features[0].properties.Latitude2);
            const routeId = e.features[0].properties.id;
    
            const arcCoordinates = interpolateArc([lng, lat], [lng2, lat2], 100);
    
            var description = `<h2>` + e.features[0].properties.title + `</h2>` + `<p>` + e.features[0].properties.locations + `</p>` + `<img src="` + e.features[0].properties.image + `">` + `<br>`  + lng2 + routeId + `</h2>`;

            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }
                            
            //only one popup once 
            e.originalEvent.cancelBubble2 = true;
            
            if (e.originalEvent.cancelBubble || e.originalEvent.cancelBubble3 || e.originalEvent.cancelBubble4) {
                return;
            }

            new mapboxgl.Popup({closeButton: false, className: 'popupSom'})
              .setLngLat(coordinates)
              .setHTML(description)
              .addTo(map);

              map.addSource(routeId, {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': [
                            [lng, lat],
                            [lng2, lat2]
                        ]
                    }
                }
              });

            map.addSource(routeId, {
    
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': arcCoordinates
                    }
                }
            });
    
            map.addLayer({
                'id': routeId,
                'type': 'line',
                'source': routeId,
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': {
                    'line-color': 'black',
                    'line-width': 8
                }
            });
        });

        map.on('mouseenter', 'episodes', function () {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'episodes', function () {
          map.getCanvas().style.cursor = '';
        });
        map.setLayoutProperty('episodes', 'icon-size', 
        ['interpolate', ['linear'], ['zoom'],0,0.04,20,0.20]);
      // });
      }).catch((error) => {
        console.error(error);
      });
};    
////

});

// After the last frame rendered before the map enters an "idle" state.
map.on('idle', () => {
    // If these two layers were not added to the map, abort
    if (!map.getLayer('videos') || !map.getLayer('memos') || !map.getLayer('episodes')) {
        return;
    }

    // Enumerate ids of the layers.
    const toggleableLayerIds = ['episodes', 'memos', 'videos'];

    // Set up the corresponding toggle button for each layer.
    for (const id of toggleableLayerIds) {
        // Skip layers that already have a button set up.
        if (document.getElementById(id)) {
            continue;
        }

        // Create a link.
        const link = document.createElement('a');
        link.id = id;
        link.href = '#';
        link.textContent = id;
        link.className = 'active';

        // Show or hide layer when the toggle is clicked.
        link.onclick = function (e) {
            const clickedLayer = this.textContent;
            e.preventDefault();
            e.stopPropagation();

            const visibility = map.getLayoutProperty(
                clickedLayer,
                'visibility'
            );

            // Toggle layer visibility by changing the layout object's visibility property.
            if (visibility === 'visible') {
                map.setLayoutProperty(clickedLayer, 'visibility', 'none');
                this.className = '';
            } else {
                this.className = 'active';
                map.setLayoutProperty(
                    clickedLayer,
                    'visibility',
                    'visible'
                );
            }
        };

        const layers = document.getElementById('menu');
        layers.appendChild(link);
    }
});
