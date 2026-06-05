"use client";

import {
  MapContainer,
  TileLayer,
  Circle,
  CircleMarker,
  Tooltip,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

const HQ: [number, number] = [38.3032, -77.4605];
const FREE_RADIUS_METERS = 15 * 1609.34;

function FitBounds({ pin }: { pin: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (pin) {
      map.fitBounds([HQ, pin], { padding: [50, 50], maxZoom: 12 });
    } else {
      map.setView(HQ, 9);
    }
  }, [pin, map]);
  return null;
}

export default function DeliveryMapInner({
  pin,
  free,
}: {
  pin: [number, number] | null;
  free: boolean | null;
}) {
  return (
    <MapContainer
      center={HQ}
      zoom={9}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      {/* Free delivery zone */}
      <Circle
        center={HQ}
        radius={FREE_RADIUS_METERS}
        pathOptions={{
          color: "#3AA84A",
          weight: 2,
          fillColor: "#3AA84A",
          fillOpacity: 0.12,
        }}
      />

      {/* HQ marker */}
      <CircleMarker
        center={HQ}
        radius={9}
        pathOptions={{ color: "#191919", weight: 2, fillColor: "#DC4327", fillOpacity: 1 }}
      >
        <Tooltip permanent direction="top" offset={[0, -8]}>
          Bounce FX · Fredericksburg
        </Tooltip>
      </CircleMarker>

      {/* Customer pin */}
      {pin && (
        <>
          <Polyline
            positions={[HQ, pin]}
            pathOptions={{ color: "#191919", weight: 2, dashArray: "6 6" }}
          />
          <CircleMarker
            center={pin}
            radius={9}
            pathOptions={{
              color: "#191919",
              weight: 2,
              fillColor: free ? "#3AA84A" : "#F9D84B",
              fillOpacity: 1,
            }}
          >
            <Tooltip permanent direction="top" offset={[0, -8]}>
              {free ? "Free delivery!" : "Your address"}
            </Tooltip>
          </CircleMarker>
        </>
      )}

      <FitBounds pin={pin} />
    </MapContainer>
  );
}
