"use client";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { use100vh } from "react-div-100vh";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import { Input, Button } from "@heroui/react";
import MapLoader from "@/components/MapLoader";
import useUbication from "../../../hooks/useUbication";
import RecenterAutomatically from "./RecenterAutomatically";

export default function LeafletMap() {
  const h = use100vh();

  const {
    address,
    isLoading,
    isError,
    error,
    getCoords,
    isLoadingCoords,
    latitude,
    longitude,
  } = useUbication();
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
    if (latitude !== null && longitude !== null) {
      setCoords({ latitude, longitude });
    }
  }, [latitude, longitude]);

  useEffect(() => {
    setAddressInput(address?.display_name as string);
  }, [address]);

  if (!h || isLoading) return <MapLoader />;

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
        style={{ height: h }}
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
          <Input
            disabled={isLoadingCoords}
            placeholder="Enter address"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
          />
          <Button
            className="ml-2"
            onClick={onSearchAddress}
            disabled={isLoadingCoords}
            isLoading={isLoadingCoords}
          >
            {isLoadingCoords ? "Loading..." : "Search"}
          </Button>
        </div>
      </div>
    </>
  );
}
