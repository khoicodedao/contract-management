import React, { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";

// World map data URL - using Natural Earth data
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface WorldMapProps {
  data: Array<{
    country: string;
    count: number;
    coordinates: [number, number];
  }>;
}

export default function WorldMap({ data }: WorldMapProps) {
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState([0, 20]);

  const maxCount = Math.max(...data.map(d => d.count));

  const getMarkerSize = (count: number) => {
    const minSize = 8;
    const maxSize = 25;
    return minSize + (count / maxCount) * (maxSize - minSize);
  };

  const getMarkerColor = (count: number) => {
    if (count >= 3) return "#dc2626"; // red-600
    if (count >= 2) return "#ea580c"; // orange-600
    return "#16a34a"; // green-600
  };

  const handleZoomIn = () => {
    if (zoom >= 4) return;
    setZoom(zoom * 2);
  };

  const handleZoomOut = () => {
    if (zoom <= 1) return;
    setZoom(zoom / 2);
  };

  const handleReset = () => {
    setZoom(1);
    setCenter([0, 20]);
  };

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Không có dữ liệu bản đồ</div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 bg-gray-50 rounded-lg overflow-hidden relative">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 140,
          center: center,
        }}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <ZoomableGroup 
          zoom={zoom} 
          center={center} 
          onMoveEnd={setCenter}
          maxZoom={8}
          minZoom={1}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#e5e7eb"
                  stroke="#d1d5db"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", fill: "#d1d5db" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>
          
          {data.map((marker, index) => (
            <Marker key={index} coordinates={marker.coordinates}>
              <circle
                r={getMarkerSize(marker.count) / zoom}
                fill={getMarkerColor(marker.count)}
                fillOpacity={0.8}
                stroke="#ffffff"
                strokeWidth={2 / zoom}
              />
              <text
                textAnchor="middle"
                y={getMarkerSize(marker.count) / zoom + 15 / zoom}
                style={{
                  fontFamily: "system-ui",
                  fontSize: `${11 / zoom}px`,
                  fontWeight: "500",
                  fill: "#374151",
                }}
              >
                {marker.country}
              </text>
              <text
                textAnchor="middle"
                y={getMarkerSize(marker.count) / zoom + 28 / zoom}
                style={{
                  fontFamily: "system-ui",
                  fontSize: `${10 / zoom}px`,
                  fill: "#6b7280",
                }}
              >
                {marker.count} hợp đồng
              </text>
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      {/* Zoom Controls */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg border flex flex-col">
        <button
          onClick={handleZoomIn}
          disabled={zoom >= 4}
          className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed border-b"
          title="Phóng to"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button
          onClick={handleZoomOut}
          disabled={zoom <= 1}
          className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed border-b"
          title="Thu nhỏ"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
          </svg>
        </button>
        <button
          onClick={handleReset}
          className="p-2 hover:bg-gray-50"
          title="Reset view"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 border">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Số lượng hợp đồng</h4>
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <span>1</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 rounded-full bg-orange-600"></div>
            <span>2</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-5 h-5 rounded-full bg-red-600"></div>
            <span>3+</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 border text-xs text-gray-600">
        <div>Kéo để di chuyển</div>
        <div>Dùng nút zoom để phóng to/thu nhỏ</div>
        <div>Zoom: {zoom.toFixed(1)}x</div>
      </div>


    </div>
  );
}