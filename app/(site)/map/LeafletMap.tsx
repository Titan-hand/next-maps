"use client";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { use100vh } from "react-div-100vh";
import { useGeolocation } from "@uidotdev/usehooks";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import MapLoader from "@/components/MapLoader";
import useUbication from "../../../hooks/useUbication";
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
        className="w-full"
        style={{ height: `calc(${h}px - ${HEADER_HEIGHT})` }}
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
      <div className="fixed bottom-2 z-[999] w-full flex items-center justify-center">
        <div className="flex items-center w-1/2">
          <input
            disabled={isLoadingCoords}
            className="pr-14 bg-white text-black w-full h-10"
            placeholder="Enter address"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
          />
          <button className="h-10 ml-2 px-4" onClick={onSearchAddress} disabled={isLoadingCoords}>
            {isLoadingCoords ? "Loading..." : "Search"}
          </button>
        </div>
      </div>
    </>
  );
}
