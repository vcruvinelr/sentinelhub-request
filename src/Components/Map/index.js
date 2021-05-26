import React, { useRef, useState, useEffect } from "react"
import "./Map.css";
import MapContext from "../../Hooks/Map/";
import Map from 'ol/Map'
import View from 'ol/View'
import { Tile as TileLayer} from 'ol/layer'
import XYZ from 'ol/source/XYZ'
import Draw from 'ol/interaction/Draw';
import WKT from 'ol/format/WKT';
import { Vector as VectorSource, TileWMS } from 'ol/source';

const WebMap = ({ children }) => {

  const mapRef = useRef();
  const [map, setMap] = useState(null);
  const [tileType, setTileType] = useState('NDVI');
  const [tilePreset, setTilePreset] = useState('NDVI');
  const mapTilerKey = '';

  useEffect(() => {
    const initialMap = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: `https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg?key=${mapTilerKey}`,
            maxZoom: 20,
          }),
        })
      ],
      view: new View({
        projection: 'EPSG:3857',
        center: [0, 0],
        zoom: 2
      }),
      controls: []
    })
    const source = new VectorSource({ wrapX: false });
    const draw = new Draw({
      source: source,
      type: 'Polygon',
    });
    initialMap.addInteraction(draw);

    draw.on('drawend', (drawned) => {

      const wktPolygon = new WKT();
      const wktTile = wktPolygon.writeGeometry(drawned.feature.getGeometry())

      const sentinelTile = new TileLayer({
        preload: Infinity,
        visible: true,
        source: new TileWMS({
          url: "https://services.sentinel-hub.com/ogc/wms/367f9e80-77fa-46b2-a288-f49a87268be2",
          params: {
            "urlProcessingApi": "https://services.sentinel-hub.com/ogc/wms/367f9e80-77fa-46b2-a288-f49a87268be2", 'crs': 'EPSG:3857', 'width': 512, 'height': 512, "preset": tilePreset, "layers": tileType, 'time': '2021-04-24/2021-05-24', 'geometry': wktTile, 'showlogo': false
          },
          serverType: 'geoserver',
          ratio: 1
        })

      })
      initialMap.addLayer(sentinelTile)
    });

    setMap(initialMap);
  }, [tilePreset, tileType]);

  return (
    <MapContext.Provider value={{ map }}>
      <div ref={mapRef} className="ol-map">
        {children}
      </div>
    </MapContext.Provider>
  )
}
export default WebMap;