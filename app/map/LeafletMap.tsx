"use client";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { use100vh } from "react-div-100vh";
import { useGeolocation } from "@uidotdev/usehooks";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import MapLoader from "@/components/MapLoader";
import useUbication from "../../hooks/useUbication";
import RecenterAutomatically from "./RecenterAutomatically";
import { HEADER_HEIGHT } from "@/const/stylesConst";

export default function LeafletMap() {
  const h = use100vh();
  const { latitude, longitude, loading, error } = useGeolocation();
  const { address, isLoading, isError, getCoords, isLoadingCoords } = useUbication();
  const [addressInput, setAddressInput] = useState<string>("");
  const [coords, setCoords] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({
    latitude,
    longitude,
  });

  const onSearchAddress = async () => {
    const result = await getCoords(addressInput);
    if (result.latitude && result.longitude) {
      setCoords(result);
    }
  };

  useEffect(() => {
    setCoords({ latitude, longitude });
  }, [latitude, longitude]);

  useEffect(() => {
    setAddressInput(address?.display_name as string);
  }, [address]);

  if (!h || isLoading || loading) return <MapLoader />;

  if (isError || error) {
    return <p>Enable permissions to access your location data</p>;
  }

  return (
    <>
      <MapContainer
        center={{
          lat: coords.latitude!,
          lng: coords.longitude!,
        }}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: `calc(${h}px - ${HEADER_HEIGHT})`, width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={{
            lat: coords.latitude!,
            lng: coords.longitude!,
          }}
        >
          <Popup>{address?.display_name}</Popup>
        </Marker>
        <RecenterAutomatically lat={coords.latitude!} lng={coords.longitude!} />
      </MapContainer>
      <div
        style={{
          position: "fixed",
          bottom: "10px",
          zIndex: 999,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", width: "50%" }}>
          <input
            disabled={isLoadingCoords}
            style={{
              paddingRight: "4.5rem",
              backgroundColor: "#fff",
              color: "#000",
              width: "100%",
              height: "2.5rem",
            }}
            placeholder="Enter address"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
          />
          <button
            style={{ height: "2.5rem", marginLeft: "0.5rem", padding: "0 1rem" }}
            onClick={onSearchAddress}
            disabled={isLoadingCoords}
          >
            {isLoadingCoords ? "Loading..." : "Search"}
          </button>
        </div>
      </div>
    </>
  );
}
