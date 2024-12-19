
// var geocoder = new MapboxGeocoder({
//     accessToken: mapboxgl.accessToken,
//     mapboxgl: mapboxgl
//  });

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


/*
AJUSTES DAS VARIAVEIS PARA CELULAR
https://gis.stackexchange.com/questions/387372/mapbox-gl-js-is-there-a-way-to-specify-a-different-zoom-level-for-mobile-devic

var mq = window.matchMedia( "(min-width: 420px)" );

if (mq.matches){
    map.setZoom(14.34); //set map zoom level for desktop size
} else {
    map.setZoom(11); //set map zoom level for mobile size
};
*/

var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/saralgc/cm2a6zb0h004f01pcfr88fj23',
  center: [-16, 38], // starting position
  zoom: 2.3, // starting zoom
  //minZoom: 1.2,
  maxZoom: 13.5
  //maxBounds: bounds // Set the map's geographical boundaries.
});

/*
var mq = window.matchMedia( "(min-width: 700px)" );
if (mq.matches){
    map.setBearing(-92); //set map zoom level for desktop size
} else {
    map.setBearing(0); //set map zoom level for mobile size
    map.setZoom(10.8);
};
*/

map.on('load', () => {
  $(document).ready(function () {
    $.ajax({
      type: "GET",
      //url: 'https://docs.google.com/spreadsheets/d/1AbjMeyFH1DJFPLmaZhIlE98_KqAEJAfxgeZnqBLMNf0/gviz/tq?tqx=out:csv&sheet=VIDEOS',
      url: 'assets/VIDEOS.csv',
      dataType: "text",
      success: function (csvData) { makeGeoJSON(csvData); }
    });
    
    $.ajax({
      type: "GET",
      //url: 'https://docs.google.com/spreadsheets/d/1AbjMeyFH1DJFPLmaZhIlE98_KqAEJAfxgeZnqBLMNf0/gviz/tq?tqx=out:csv&sheet=memos',
      url: 'assets/memos.csv',
      dataType: "text",
      success: function (csvData) { makeGeoJSON2(csvData); }
    });

    $.ajax({
      type: "GET",
      //url: 'https://docs.google.com/spreadsheets/d/1AbjMeyFH1DJFPLmaZhIlE98_KqAEJAfxgeZnqBLMNf0/gviz/tq?tqx=out:csv&sheet=episodes',
      url: 'assets/episodes.csv',
      dataType: "text",
      success: function (csvData) { makeGeoJSON3(csvData); }
    });

    });

    // episodes

    function makeGeoJSON3(csvData) {
      csv2geojson.csv2geojson(csvData, {
        latfield: 'Latitude',
        lonfield: 'Longitude',
        delimiter: ','
      }, function (err, data) {

        map.loadImage('assets/icon1.png',
            function(error, image){
            if (error) throw error;
            map.addImage('episode_icon', image);
            }
        );

          // LAYER
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

          /*map.on('click', 'episodes', function (e) {
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

          map.on('mouseenter', 'episodes', function () {
            map.getCanvas().style.cursor = 'pointer';
          });

          map.on('mouseleave', 'episodes', function () {
            map.getCanvas().style.cursor = '';
          });

            map.setLayoutProperty('episodes', 'icon-size', 
          ['interpolate', ['linear'], ['zoom'],11,0.05,14,0.25]);
          
        // });
        }).catch((error) => {
          console.error(error);
        });
      };    
    
    // memos

    function makeGeoJSON2(csvData) {
      csv2geojson.csv2geojson(csvData, {
        latfield: 'Latitude',
        lonfield: 'Longitude',
        delimiter: ','
      }, function (err, data) {
        
        const images = [
          { name: 'f1', path: 'assets/fotos.png' },
          { name: 'f2', path: 'assets/fotos2.png' },
          { name: 'f3', path: 'assets/fotos3.png' },
          { name: 'f4', path: 'assets/fotos4.png' }
        ];

        Promise.all(
          images.map(image => new Promise((resolve, reject) => {
            map.loadImage(
              image.path,
              function(error, img) {
                if (error) reject(error);
                map.addImage(image.name, img);
                resolve();
              }
            );
          }))
        ).then(() => {

          // LAYER
          map.addLayer({
            'id': 'memos',
            'type': 'symbol',
            'source': {
              'type': 'geojson',
              'data': data
            },

            'layout': {
              'visibility': 'visible',
              'icon-image': '{Icon}',
              'icon-anchor': 'bottom',
              "icon-allow-overlap": true,
            }
          });        

          map.on('click', 'memos', function (e) {
              var coordinates = e.features[0].geometry.coordinates.slice();

              //var description = `<img src="./assets/fotos/foto` + e.features[0].properties.Galeria + `.png" style="width:80%;">`;
              var description = '<a href="../assets/fotos/foto' + e.features[0].properties.Galeria + '_4.png"><img src="../assets/fotos/foto' + e.features[0].properties.Galeria + '_4.png"></a>';
              
              var images =  [
                    ['assets/fotos/foto' + e.features[0].properties.Galeria + '_1.jpg'],
                    ['assets/fotos/foto' + e.features[0].properties.Galeria + '_2.jpg'],
                    ['assets/fotos/foto' + e.features[0].properties.Galeria + '_3.jpg'],
                    ['assets/fotos/foto' + e.features[0].properties.Galeria + '_4.jpg'],
                    ['assets/fotos/foto' + e.features[0].properties.Galeria + '_5.jpg'],
                    ['assets/fotos/foto' + e.features[0].properties.Galeria + '_6.jpg'],
                    ['assets/fotos/foto' + e.features[0].properties.Galeria + '_7.jpg'],
                    ['assets/fotos/foto' + e.features[0].properties.Galeria + '_8.jpg'],
                    ['assets/fotos/foto' + e.features[0].properties.Galeria + '_9.jpg'],
                    ['assets/fotos/foto' + e.features[0].properties.Galeria + '_10.jpg'],
                    ['assets/fotos/foto' + e.features[0].properties.Galeria + '_11.jpg'],
                    ['assets/fotos/foto' + e.features[0].properties.Galeria + '_12.jpg'],
                    ['assets/fotos/foto' + e.features[0].properties.Galeria + '_13.jpg'],
                    ['assets/fotos/foto' + e.features[0].properties.Galeria + '_14.jpg'],
                    ['assets/fotos/foto' + e.features[0].properties.Galeria + '_15.jpg'],
                    ['assets/fotos/foto' + e.features[0].properties.Galeria + '_16.jpg']
                    ]
              
              var slideshowContent = ""
              
              for (var i = 0; i < images.length; i++) {
                var img = images[i];

                slideshowContent += '<div class="image' + (i === 0 ? ' active' : '') + '">' +
                  '<img src="' + img[0] + '" />' +
                  '</div>';
              }
              
              var popupContent = '<div class="popup">' + 
                '<div class="slideshow">' +
                slideshowContent +
                '</div>' +
                '<div class="cycle">' +
                '<a href="#" class="prev">‹</a>' +
                '<a href="#" class="next">›</a>' +
                '</div>' +
              '</div>';
              

              while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
              coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
              }

              /* mostarda();*/

              //only one popup once 
              e.originalEvent.cancelBubble3 = true;
              if (e.originalEvent.cancelBubble || e.originalEvent.cancelBubble2 || e.originalEvent.cancelBubble4) {
                  return;
              }

                // create the popup
              /*                
              new mapboxgl.Popup({className: 'popupmemos'})
                .setLngLat(coordinates)
                .setPopup(description)
                .addTo(map); */

              
              new mapboxgl.Popup({closeButton: true, className: 'popupmemos'})
                .setLngLat(coordinates)
                .setHTML(popupContent)
                .addTo(map); 
          });


          $('#map').on('click', '.popup .cycle a', function () {
          var $slideshow = $('.slideshow'),
            $newSlide;

          if ($(this).hasClass('prev')) {
            $newSlide = $slideshow.find('.active').prev();
            if ($newSlide.index() < 0) {
              $newSlide = $('.image').last();
            }
          } else {
            $newSlide = $slideshow.find('.active').next();
            if ($newSlide.index() < 0) {
              $newSlide = $('.image').first();
            }
          }

          $slideshow.find('.active').removeClass('active').hide();
          $newSlide.addClass('active').show();
          return false;
        }); 

        

          map.on('mouseenter', 'memos', function () {
            map.getCanvas().style.cursor = 'pointer';
          });

          map.on('mouseleave', 'memos', function () {
            map.getCanvas().style.cursor = '';
          });

            map.setLayoutProperty('memos', 'icon-size', 
          ['interpolate', ['linear'], ['zoom'],11,0.08,14,0.4]);
          
        // });

        }).catch((error) => {
          console.error(error);
        });
      });
    }    
    
    
    function makeGeoJSON(csvData) {
      csv2geojson.csv2geojson(csvData, {
        latfield: 'Latitude',
        lonfield: 'Longitude',
        delimiter: ','
      }, function (err, data) {      
                   
        const images = [
          { name: 'video_panela', path: 'assets/video_panela.png' },
          { name: 'video_feijao', path: 'assets/video_feijao.png' },
          { name: 'video_tambor', path: 'assets/video_tambor.png' },
          { name: 'video_ovo', path: 'assets/video_ovo.png' },
          { name: 'video_vaca', path: 'assets/video_vaca.png' },
          { name: 'video_banana', path: 'assets/video_banana.png' },
          { name: 'video_fogo', path: 'assets/video_fogo.png' },
          { name: 'video_milho', path: 'assets/video_milho.png' },
          { name: 'video_quiabo', path: 'assets/video_quiabo.png' },
          { name: 'video_paudoce', path: 'assets/video_paudoce.png' },
          { name: 'video_porco', path: 'assets/video_porco.png' },
          { name: 'video_pimenta', path: 'assets/video_pimenta.png' },
          { name: 'video_arroz', path: 'assets/video_arroz.png' },
          { name: 'v4', path: 'assets/v4.png' }
        ];

        Promise.all(
          images.map(image => new Promise((resolve, reject) => {
            map.loadImage(
              image.path,
              function(error, img) {
                if (error) reject(error);
                map.addImage(image.name, img);
                resolve();
              }
            );
          }))
        ).then(() => {

          // LAYER
          map.addLayer({
            'id': 'Videos',
            'type': 'symbol',
            'source': {
              'type': 'geojson',
              'data': data
            },

            'layout': {
              'visibility': 'visible',
              'icon-image': '{Icon}',
              'icon-anchor': 'bottom',
              "icon-allow-overlap": true,
            }
          });        

          map.on('click', 'Videos', function (e) {
              var coordinates = e.features[0].geometry.coordinates.slice();

              var description = `<iframe src="https://player.vimeo.com/video/`+e.features[0].properties.Link +`?portrait=0" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`;


              while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
              coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
              }

              /*agua();*/

              //only one popup once 
              e.originalEvent.cancelBubble4 = true;
              if (e.originalEvent.cancelBubble || e.originalEvent.cancelBubble2 || e.originalEvent.cancelBubble3) {
                  return;
              }

              new mapboxgl.Popup({closeButton: false, className: 'popupVideo'})
                .setLngLat(coordinates)
                .setHTML(description)
                .addTo(map);
          });

          map.on('mouseenter', 'Videos', function () {
            map.getCanvas().style.cursor = 'pointer';
          });

          map.on('mouseleave', 'Videos', function () {
            map.getCanvas().style.cursor = 'default';
          });

            map.setLayoutProperty('Videos', 'icon-size', 
          ['interpolate', ['linear'], ['zoom'],11,0.07,14,0.3]);
            
        // });

        }).catch((error) => {
          console.error(error);
        });
      });
    } 
    
 });
  
// TOGGLEABLE LAYERS 
// https://stackoverflow.com/questions/61514972/mapbox-visibility-none-for-all-layers-when-one-is-visible

 // enumerate ids of the layers
 var toggleableLayerIds = ['episodes', 'Videos', 'memos'];

 // set up the corresponding toggle button for each layer
 for (var i = 0; i < toggleableLayerIds.length; i++) {
     var id = toggleableLayerIds[i];
       var link = document.createElement('a');
       link.href = '#';
       link.className = '';
       if (i === 4) {
         link.className = 'title';
       }
       link.textContent = id;


    link.onclick = function(e) {
      var clickedLayer = this.textContent;
      e.preventDefault();
      e.stopPropagation(); 
      for (var j = 0; j < toggleableLayerIds.length; j++) {
        if (clickedLayer === toggleableLayerIds[j]) {
          //layers.children[j].className = 'active';
          if (j == 4) { 
            creme(); 
            map.setLayoutProperty(toggleableLayerIds[0], 'visibility', 'visible');
            map.setLayoutProperty(toggleableLayerIds[1], 'visibility', 'visible');
            map.setLayoutProperty(toggleableLayerIds[2], 'visibility', 'visible');
            map.setLayoutProperty(toggleableLayerIds[3], 'visibility', 'visible');                   
          } else {
            map.setLayoutProperty(toggleableLayerIds[j], 'visibility', 'visible');
            if (j == 0) { ficha("var(--rosa)"); }
            if (j == 1) { ficha("var(--agua)"); }
            if (j == 2) { ficha("var(--mostarda)"); }
            if (j == 3) { ficha("var(--marrom)"); }         
          }
        } else {
          if (j != 4) {
            //layers.children[j].className = '';
            map.setLayoutProperty(toggleableLayerIds[j], 'visibility', 'none');
          }
        }
      }
    };

     var layers = document.getElementById('menu');
     layers.appendChild(link);
     }


  map.on('load', () => {

  });

// ZOOM
map.addControl(new mapboxgl.NavigationControl(), 'top-right'); // disable map zoom when using scroll
//  map.scrollZoom.disable();