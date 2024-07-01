"use client";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { use100vh } from "react-div-100vh";
import {
  Input,
  Box,
  InputRightElement,
  InputGroup,
  Button,
} from "@chakra-ui/react";
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
  const { address, isLoading, isError, getCoords, isLoadingCoords } =
    useUbication();
  const [addressInput, setAddressInput] = useState("");
  const [coords, setCoords] = useState({
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
      <Box
        position="fixed"
        bottom={10}
        zIndex={999}
        width="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <InputGroup
          size="md"
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="50%"
        >
          <Input
            disabled={isLoadingCoords}
            pr="4.5rem"
            backgroundColor={"#fff"}
            color={"#000"}
            placeholder="Enter address"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
          />
          <InputRightElement width="5rem">
            <Button
              h="1.75rem"
              size="sm"
              onClick={onSearchAddress}
              isLoading={isLoadingCoords}
            >
              Search
            </Button>
          </InputRightElement>
        </InputGroup>
      </Box>
    </>
  );
}
