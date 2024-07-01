"use client";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { use100vh } from "react-div-100vh";
import { useGeolocation } from "@uidotdev/usehooks";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import useUbication from "../../hooks/useUbication";
import { HEADER_HEIGHT } from "@/const/stylesConst";

export default function LeafletMap() {
  const h = use100vh();
  const state = useGeolocation();
  const { address, isLoading, isError } = useUbication();

  if (!h || isLoading) return "Loading...";

  if (state.loading) {
    return <p>loading... (you may need to enable permissions)</p>;
  }

  if (isError) {
    return <p>Enable permissions to access your location data</p>;
  }

  if (state.error) {
    return <p>Enable permissions to access your location data</p>;
  }

  return (
    <MapContainer
      center={{
        lat: state.latitude!,
        lng: state.longitude!,
      }}
      zoom={12}
      scrollWheelZoom={true}
      style={{
        height: `calc(${h}px - ${HEADER_HEIGHT})`,
        width: "100%",
        zIndex: 1,
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker
        position={{
          lat: state.latitude!,
          lng: state.longitude!,
        }}
      >
        <Popup>{address?.display_name}</Popup>
      </Marker>
    </MapContainer>
  );
}
