"use client";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { use100vh } from "react-div-100vh";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import { useEffect, useState } from "react";
import { Input, Button, Switch } from "@heroui/react";
import { FaPlus, FaLocationDot } from "react-icons/fa6";
import { toast } from "sonner";
import L from "leaflet";
import MapLoader from "@/components/MapLoader";
import PlacePopover from "@/components/PlacePopover";
import useUbication from "../../../hooks/useUbication";
import useAuth from "../../../hooks/useAuth";
import { usePlaces } from "../../../hooks/usePlaces";
import RecenterAutomatically from "./RecenterAutomatically";
import { Tables } from "@/types/supa_database.types";

type Place = Tables<"places">;
type PlacePhoto = Tables<"place_photos">;

interface PlaceWithPhotos extends Place {
  place_photos: PlacePhoto[];
  is_favorited?: boolean;
}

// Custom icons for different types of markers
const userLocationIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const placeIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const favoritePlaceIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component for handling map clicks when in add place mode
function AddPlaceClickHandler({
  isAddMode,
  onAddPlace,
}: {
  isAddMode: boolean;
  onAddPlace: (lat: number, lng: number, zoom: number) => void;
}) {
  const map = useMapEvents({
    click(e) {
      if (isAddMode) {
        const { lat, lng } = e.latlng;
        const zoom = map.getZoom();
        onAddPlace(lat, lng, zoom);
      }
    },
  });

  return null;
}

export default function LeafletMap() {
  const h = use100vh();
  const { user } = useAuth();
  const {
    address,
    isLoading: isLocationLoading,
    isError,
    error,
    getCoords,
    isLoadingCoords,
    latitude,
    longitude,
  } = useUbication();

  const { places, createPlace, isLoading: isPlacesLoading } = usePlaces();

  // Local state
  const [addressInput, setAddressInput] = useState<string>("");
  const [coords, setCoords] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({
    latitude,
    longitude,
  });

  // Add place mode state
  const [isAddPlaceMode, setIsAddPlaceMode] = useState(false);

  // Place popover state
  const [selectedPlace, setSelectedPlace] = useState<PlaceWithPhotos | null>(
    null
  );
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isNewPlace, setIsNewPlace] = useState(false);

  const onSearchAddress = async () => {
    const result = await getCoords(addressInput);
    if (result.latitude && result.longitude) {
      setCoords(result);
    }
  };

  const handleAddPlace = async (lat: number, lng: number, zoom: number) => {
    if (!user) {
      toast.error("Please log in to add places");
      return;
    }

    try {
      // Create the place in the database
      const newPlace = await createPlace({
        latitude: lat,
        longitude: lng,
        title: `Place at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        description: null,
        zoom_level: zoom,
      });

      if (newPlace) {
        // Open the popover for editing immediately
        setSelectedPlace(newPlace);
        setIsNewPlace(true);
        setIsPopoverOpen(true);
        setIsAddPlaceMode(false);

        toast.success("Place added! Add details now.");
      } else {
        toast.error("Failed to add place");
      }
    } catch (error) {
      console.error("Error adding place:", error);
      toast.error("Failed to add place");
    }
  };

  const handlePlaceClick = (place: PlaceWithPhotos) => {
    console.log("handlePlaceClick called with place:", place);
    setSelectedPlace(place);
    setIsNewPlace(false);
    setIsPopoverOpen(true);
    console.log("Set isPopoverOpen to true");
  };

  const handlePlaceUpdate = (updatedPlace: Place) => {
    // The places will be refetched automatically via the usePlaces hook
    toast.success("Place updated successfully!");
  };

  const handlePlaceDelete = (placeId: string) => {
    // The places will be refetched automatically via the usePlaces hook
    toast.success("Place deleted successfully!");
  };

  const handlePopoverClose = () => {
    setIsPopoverOpen(false);
    setSelectedPlace(null);
    setIsNewPlace(false);
  };

  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      setCoords({ latitude, longitude });
    }
  }, [latitude, longitude]);

  useEffect(() => {
    setAddressInput(address?.display_name as string);
  }, [address]);

  useEffect(() => {
    console.log("PlacePopover state changed:", {
      selectedPlace: selectedPlace?.id,
      isPopoverOpen,
      isNewPlace,
    });
  }, [selectedPlace, isPopoverOpen, isNewPlace]);

  if (!h || isLocationLoading) return <MapLoader />;

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
        style={{
          height: h,
          cursor: isAddPlaceMode ? "crosshair" : "grab",
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User's current location marker */}
        <Marker
          position={{
            lat: coords.latitude!,
            lng: coords.longitude!,
          }}
          icon={userLocationIcon}
        >
          <Popup>
            <div>
              <strong>Your Location</strong>
              <br />
              {address?.display_name}
            </div>
          </Popup>
        </Marker>

        {/* User's saved places */}
        {places.map((place) => (
          <Marker
            key={place.id}
            position={{ lat: place.latitude, lng: place.longitude }}
            icon={place.is_favorited ? favoritePlaceIcon : placeIcon}
            eventHandlers={{
              click: () => handlePlaceClick(place),
            }}
          >
            <Popup>
              <div className="min-w-[220px] max-w-[280px]">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-800 leading-tight">
                      {place.title}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-gray-500">
                        {place.latitude.toFixed(4)},{" "}
                        {place.longitude.toFixed(4)}
                      </span>
                    </div>
                  </div>
                  {place.is_favorited && (
                    <span className="ml-2 text-yellow-500 text-sm flex-shrink-0">
                      ⭐
                    </span>
                  )}
                </div>

                {place.description && (
                  <p className="text-xs text-gray-600 mb-3 line-clamp-3 leading-relaxed">
                    {place.description}
                  </p>
                )}

                <div className="border-t border-gray-200 pt-2">
                  <button
                    onClick={() => {
                      console.log("Popup button clicked for place:", place);
                      handlePlaceClick(place);
                    }}
                    className="w-full text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-2 px-3 rounded-md transition-colors duration-200 border border-blue-200"
                  >
                    View Details & Photos
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Click handler for adding places */}
        <AddPlaceClickHandler
          isAddMode={isAddPlaceMode}
          onAddPlace={handleAddPlace}
        />

        <RecenterAutomatically lat={coords.latitude!} lng={coords.longitude!} />
      </MapContainer>

      {/* Controls overlay */}
      <div className="fixed bottom-2 z-[999] w-full flex flex-col items-center gap-3">
        {/* Add place mode toggle */}
        {user && (
          <div className="bg-white rounded-full shadow-lg px-4 py-2 flex items-center gap-3 border">
            <Switch
              size="sm"
              isSelected={isAddPlaceMode}
              onValueChange={setIsAddPlaceMode}
              color="primary"
            />
            <span className="text-sm font-medium flex items-center gap-2">
              <FaPlus
                className={isAddPlaceMode ? "text-primary" : "text-gray-400"}
              />
              Add Place Mode
            </span>
            {isAddPlaceMode && (
              <span className="text-xs text-gray-500">Click map to add</span>
            )}
          </div>
        )}

        {/* Search bar */}
        <div className="flex items-center w-1/2 bg-white rounded-full shadow-lg p-2">
          <FaLocationDot className="text-gray-400 ml-3 mr-2" />
          <Input
            disabled={isLoadingCoords}
            placeholder="Search for a place..."
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            variant="flat"
            className="flex-1"
            classNames={{
              input: "border-none bg-transparent",
              inputWrapper: "border-none bg-transparent shadow-none",
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                onSearchAddress();
              }
            }}
          />
          <Button
            isIconOnly
            color="primary"
            onPress={onSearchAddress}
            disabled={isLoadingCoords}
            isLoading={isLoadingCoords}
            className="ml-2"
            size="sm"
          >
            🔍
          </Button>
        </div>

        {/* Status indicators */}
        {!user && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-1 rounded-full text-xs">
            Log in to save places
          </div>
        )}

        {isPlacesLoading && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-3 py-1 rounded-full text-xs">
            Loading your places...
          </div>
        )}
      </div>

      {/* Place popover */}
      <PlacePopover
        place={selectedPlace}
        isOpen={isPopoverOpen}
        onClose={handlePopoverClose}
        onPlaceUpdate={handlePlaceUpdate}
        onPlaceDelete={handlePlaceDelete}
        isNewPlace={isNewPlace}
      />
    </>
  );
}
