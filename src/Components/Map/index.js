import React, { useRef, useState, useEffect } from "react"
import "./Map.css";
import MapContext from "../../Hooks/Map/";
import Map from 'ol/Map'
import View from 'ol/View'
import { Group as LayerGroup, Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import XYZ from 'ol/source/XYZ'
import Draw from 'ol/interaction/Draw';
import WKT from 'ol/format/WKT';
import { Vector as VectorSource, TileWMS } from 'ol/source';
import "ol-ext/dist/ol-ext.css";
import Swipe from "ol-ext/control/Swipe";
import OSM from 'ol/source/OSM';
import Control from 'ol/control/Control';
import Select from 'ol/interaction/Select';
import { altKeyOnly, click, pointerMove } from 'ol/events/condition';
import * as turf from '@turf/turf'
import { useGeographic } from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON';
import { getLength } from 'ol/sphere';

const WebMap = ({ children }) => {


  const mapRef = useRef();
  const controlRef = useRef();
  const [map, setMap] = useState(null);
  const [tileType, setTileType] = useState('NDVI');
  const [tilePreset, setTilePreset] = useState('NDVI');
  const mapTilerKey = 'kXP64NxsbG5krLKKy1HS';
  const maptiler = new LayerGroup({
    layers: [
      new TileLayer({
        source: new XYZ({
          url: `https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg?key=${mapTilerKey}`,
          maxZoom: 20,
        }),
      })
    ]
  })

  var osm = new TileLayer({
    source: new OSM()
  });

  const source = new VectorSource({ wrapX: false });
  const draw = new Draw({
    source: source,
    type: 'LineString',
  });

  const vector = new VectorLayer({
    source: source,
  });

  const select = new Select();
  useGeographic();
  useEffect(() => {

    const initialMap = new Map({
      target: mapRef.current,
      layers: [maptiler, vector],
      view: new View({
        projection: 'EPSG:3857',
        center: [0, 0],
        zoom: 2
      }),
      controls: []
    })
    var ctrl = new Swipe();
    initialMap.addInteraction(select);
    initialMap.addControl(ctrl);
    ctrl.addLayer(maptiler);
    ctrl.addLayer(maptiler, true);

    initialMap.addInteraction(draw);

    select.on('select', (e) => {
      console.log(e);
    })

    draw.on('drawend', (d) => {

      initialMap.removeInteraction(draw);
      //var line = d.feature.getGeometry().getCoordinates()

      // var points = 20
      // var pointsDistance = length / points
      // var options = { units: 'kilometers' };
      // var along = turf.along(line, 0.1, options);
      // var along = turf.along(line, length, options);
      // var init = 0

      // get line lenght
      var line = turf.lineString(d.feature.getGeometry().getCoordinates());
      var length = turf.length(line, { units: 'kilometers' });
      var points = 20
      var pointsDistance = Math.round(length) / points
      console.log(pointsDistance)
      var along = turf.along(line, 0, { units: 'kilometers' });
      var vectorSource = new VectorSource({
        features: new GeoJSON().readFeatures(along),
      });
      var vectorLayer = new VectorLayer({
        source: vectorSource
      });

      initialMap.addLayer(vectorLayer)
      var init = 0

      while (init <= length) {
        init += pointsDistance
        console.log(init)
        var along = turf.along(line, init, { units: 'kilometers' });
        
        var vectorSource = new VectorSource({
          features: new GeoJSON().readFeatures(along),
        });
        var vectorLayer = new VectorLayer({
          source: vectorSource
        });
        initialMap.addLayer(vectorLayer)
      }


      // while (init <= length) {
      //   init += Math.round(pointsDistance)
      //   var options = { units: 'kilometers' };
      //   var along = turf.along(line, init, options);
      //   var vectorSource = new VectorSource({
      //     features: new GeoJSON().readFeatures(along),
      //   });
      //   var vectorLayer = new VectorLayer({
      //     source: vectorSource
      //   });

      //   initialMap.addLayer(vectorLayer)

      // }



      // var lineLength = getLength(d.feature.getGeometry())
      // console.log(Math.round(lineLength * 100) / 100 + ' ' + 'm')

    })
    ctrl.addLayer(vector, true);
    // draw.on('drawend', (drawned) => {
    //   console.log(drawned)

    // const wktPolygon = new WKT();
    // const wktTile = wktPolygon.writeGeometry(drawned.feature.getGeometry())

    // const sentinelTile = new TileLayer({
    //   preload: Infinity,
    //   visible: true,
    //   source: new TileWMS({
    //     url: "https://services.sentinel-hub.com/ogc/wms/367f9e80-77fa-46b2-a288-f49a87268be2",
    //     params: {
    //       "urlProcessingApi": "https://services.sentinel-hub.com/ogc/wms/367f9e80-77fa-46b2-a288-f49a87268be2", 'crs': 'EPSG:3857', 'width': 512, 'height': 512, "preset": tilePreset, "layers": tileType, 'time': '2021-04-24/2021-05-24', 'geometry': wktTile, 'showlogo': false
    //     },
    //     serverType: 'geoserver',
    //     ratio: 1
    //   })

    // })
    // var myControl = new Control({element: controlRef});
    // initialMap.addControl(myControl)
    // ctrl.addLayer(sentinelTile);
    //initialMap.addLayer(drawned.feature.getGeometry())
    //});

    setMap(initialMap);


  }, [tilePreset, tileType]);

  return (
    <MapContext.Provider value={{ map }}>
      <div ref={mapRef} className="ol-map"></div>
      <div ref={controlRef} onClick={() => console.log("ok")} className='buttonMap'><button>BOTÃO TESTE FMT</button></div>
    </MapContext.Provider>
  )
}
export default WebMap;