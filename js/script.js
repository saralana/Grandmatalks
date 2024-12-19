// Verificar utilidade
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
    center: [-44.8, 41.8], // starting position
    zoom: 2.4, // starting zoom
    minZoom: 2,
    maxZoom: 20
    //maxBounds: bounds // Set the map's geographical boundaries.
});


    // Wait until the map has finished loading.
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
            url: 'https://docs.google.com/spreadsheets/d/1DCAUiy3GIoZTE5kUpIGXrIIUeIbGJZ7e9TsybO0A88M/gviz/tq?tqx=out:csv&sheet=videos',
            //url: 'assets/videos.csv',
            dataType: "text",
            success: function (csvData) { makeGeoJSON(csvData); }
        });
            
        $.ajax({
            type: "GET",
            url: 'https://docs.google.com/spreadsheets/d/1DCAUiy3GIoZTE5kUpIGXrIIUeIbGJZ7e9TsybO0A88M/gviz/tq?tqx=out:csv&sheet=memos',
            //url: 'assets/memos.csv',
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
  
            map.loadImage('assets/icon_memos.png',
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

                var description = `<h2>` + e.features[0].properties.title + `</h2>` + `<p>` + e.features[0].properties.location + `  |  ` + e.features[0].properties.date + `</p>` + `<p>` + e.features[0].properties.description + `</p>`
                + `<audio controls style="width:100%;" controlsList="nodownload" autoplay><source src="` + e.features[0].properties.memo + `" type="audio/mpeg"></audio>`;

                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }
  
                //only one popup once 
                e.originalEvent.cancelBubble2 = true;
                
                if (e.originalEvent.cancelBubble || e.originalEvent.cancelBubble3 || e.originalEvent.cancelBubble4) {
                    return;
                }
  
                new mapboxgl.Popup({closeButton: false, className: 'popupEpisodes'})
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
  
          map.loadImage('assets/icon_videos.png',
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

            map.on('click', 'videos', function (e) {

                var coordinates = e.features[0].geometry.coordinates.slice();
                var lng = coordinates[0];
                var lat = coordinates[1];
                var lng2 = parseFloat(e.features[0].properties.Longitude2);
                var lat2 = parseFloat(e.features[0].properties.Latitude2);
                var routeId = e.features[0].properties.id;
  
                var description = `<h2>` + e.features[0].properties.title + `</h2>` + `<p>` + e.features[0].properties.locations + `</p>` + `<p>` + e.features[0].properties.date + `</p>` + `<p>` + e.features[0].properties.description + `</p>`
                + `<iframe width="100%" height="300px" src="https://www.youtube.com/embed/` + e.features[0].properties.embed + `" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>` + 
                `<br>` + `<a href="` + e.features[0].properties.episode + `" target="_blank">go to the episode </a>`;

                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }
  
                //only one popup once 
                e.originalEvent.cancelBubble2 = true;
                
                if (e.originalEvent.cancelBubble || e.originalEvent.cancelBubble3 || e.originalEvent.cancelBubble4) {
                    return;
                }
  
                // Turf.js to create arc between coordinates
                const start = turf.point([lng, lat]);
                const end = turf.point([lng2, lat2]);
                const arc = turf.greatCircle(start, end, { npoints: 50 }); // 100 segmentos para suavidade
                // Calcular o ponto mediano do arco
                const arcLength = turf.length(arc); // Comprimento total do arco
                const midpoint = turf.along(arc, arcLength / 2); // Ponto mediano
                const midpointCoords = midpoint.geometry.coordinates; // Coordenadas do ponto mediano
                
                const popup = new mapboxgl.Popup({closeButton: false, className: 'popupEpisodes'})
                .setLngLat(midpointCoords)
                .setHTML(description)
                .addTo(map);

                //check if the arc source already exists before creating it
                if (!map.getSource(routeId)) {
                    map.addSource(routeId, {
                        'type': 'geojson',
                        'data': arc
                    });
                    console.log("Source created with routeId:", routeId);
                } else {
                    console.log("Source with routeId already exists.");
                }

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
                        'line-width': 2,
                        'line-dasharray': [2, 4],
                    }
                });
                
                popup.on('close', function () {
                    map.removeLayer(routeId);  // Remove the arc layer when the popup closes
                });   
            });
                      
  
            map.on('mouseenter', 'videos', function () {
              map.getCanvas().style.cursor = 'pointer';
            });
            map.on('mouseleave', 'videos', function () {
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
  
          map.loadImage('assets/icon_episodes.png',
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
                'icon-anchor': 'top',
                "icon-allow-overlap": true,
              }
  
            }); 
 

            map.on('click', 'episodes', function (e) {
                
                var coordinates = e.features[0].geometry.coordinates.slice();
                var lng = coordinates[0];
                var lat = coordinates[1];
                var lng2 = parseFloat(e.features[0].properties.Longitude2);
                var lat2 = parseFloat(e.features[0].properties.Latitude2);
                var routeId = e.features[0].properties.id;

                 // Base structure

                const properties = e.features[0].properties;
                var description = `
                    <h2>${properties.title}</h2>
                    <p>${properties.locations}</p>
                    <img src="${properties.image}">
                `;
                // Loop through numbered entries
                let index = 1;
                while (
                    properties[`date${index}`] &&
                    properties[`player${index}`] &&
                    properties[`episode${index}`]
                ) {
                    description += `
                        <p>${properties[`date${index}`]}</p>
                        <audio controls style="width:100%;" controlsList="nodownload">
                            <source src="${properties[`player${index}`]}" type="audio/mpeg">
                        </audio>
                        <a href="${properties[`episode${index}`]}" target="_blank">go to episode ${index}</a>
                    `;
                    index++;
                }

                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }
                                
                //only one popup once 
                e.originalEvent.cancelBubble2 = true;
                if (e.originalEvent.cancelBubble || e.originalEvent.cancelBubble3 || e.originalEvent.cancelBubble4) {
                    return;
                }
                
                // Turf.js to create arc between coordinates
                const start = turf.point([lng, lat]);
                const end = turf.point([lng2, lat2]);
                const arc = turf.greatCircle(start, end, { npoints: 50 }); // 100 segmentos para suavidade
                // Calcular o ponto mediano do arco
                const arcLength = turf.length(arc); // Comprimento total do arco
                const midpoint = turf.along(arc, arcLength / 2); // Ponto mediano
                const midpointCoords = midpoint.geometry.coordinates; // Coordenadas do ponto mediano
                
                const popup = new mapboxgl.Popup({closeButton: false, className: 'popupEpisodes'})
                .setLngLat(midpointCoords)
                .setHTML(description)
                .addTo(map);

                //check if the arc source already exists before creating it
                if (!map.getSource(routeId)) {
                    map.addSource(routeId, {
                        'type': 'geojson',
                        'data': arc
                    });
                    console.log("Source created with routeId:", routeId);
                } else {
                    console.log("Source with routeId already exists.");
                }

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
                        'line-width': 2,
                        'line-dasharray': [2, 4],
                    }
                });
            
                popup.on('close', function () {
                    map.removeLayer(routeId);  // Remove the arc layer when the popup closes
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
            link.className = 'active';
            link.style.display = 'flex'; // Use flexbox
            link.style.alignItems = 'center'; // Vertically center

            // Add an image inside the link.
            const img = document.createElement('img');
            img.src = 'assets/icon_'+id+'.png'; // Replace with your image path
            img.alt = id; // Alt text for the image
            img.style.width = '30px'; // Set image size
            img.style.height = '30px'; 
            img.style.margin = '5px'; 

            // Add text inside the link.
            const text = document.createTextNode(id);

            // Append the image and text to the link.
            link.appendChild(img);
            link.appendChild(text);

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