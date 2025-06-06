"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Image,
  Chip,
  Tabs,
  Tab,
} from "@heroui/react";
import {
  FaHeart,
  FaRegHeart,
  FaMapMarkerAlt,
  FaSearch,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { toast } from "sonner";
import { usePlaces } from "@/hooks/usePlaces";
import useAuth from "@/hooks/useAuth";
import PlacePopover from "@/components/PlacePopover";
import { Tables } from "@/types/supa_database.types";

type Place = Tables<"places">;
type PlacePhoto = Tables<"place_photos">;

interface PlaceWithPhotos extends Place {
  place_photos: PlacePhoto[];
  is_favorited?: boolean;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { places, toggleFavorite, isLoading } = usePlaces();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<PlaceWithPhotos | null>(
    null
  );
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Filter places based on search term and active tab
  const filteredPlaces = places.filter((place) => {
    const matchesSearch =
      place.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (place.description?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false);

    if (activeTab === "favorites") {
      return matchesSearch && place.is_favorited;
    }

    return matchesSearch;
  });

  const handlePlaceClick = (place: PlaceWithPhotos) => {
    setSelectedPlace(place);
    setIsPopoverOpen(true);
  };

  const handleFavoriteToggle = async (place: PlaceWithPhotos, e: any) => {
    e.stopPropagation();
    const newStatus = await toggleFavorite(place.id);
    toast.success(newStatus ? "Added to favorites" : "Removed from favorites");
  };

  const getPhotoUrl = (photo: PlacePhoto) => {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/bucket1/${photo.storage_path}`;
  };

  const handlePlaceUpdate = (updatedPlace: Place) => {
    toast.success("Place updated successfully!");
  };

  const handlePlaceDelete = (placeId: string) => {
    toast.success("Place deleted successfully!");
  };

  const handlePopoverClose = () => {
    setIsPopoverOpen(false);
    setSelectedPlace(null);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Please log in to view your profile
          </h1>
          <p className="text-gray-600">
            You need to be logged in to see your saved places.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Places</h1>
        <p className="text-gray-600">
          Manage your saved locations and favorite spots
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardBody className="text-center">
            <h3 className="text-2xl font-bold text-blue-600">
              {places.length}
            </h3>
            <p className="text-gray-600">Total Places</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <h3 className="text-2xl font-bold text-red-600">
              {places.filter((p) => p.is_favorited).length}
            </h3>
            <p className="text-gray-600">Favorites</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <h3 className="text-2xl font-bold text-green-600">
              {places.reduce(
                (acc, place) => acc + place.place_photos.length,
                0
              )}
            </h3>
            <p className="text-gray-600">Photos</p>
          </CardBody>
        </Card>
      </div>

      {/* Controls */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search your places..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startContent={<FaSearch className="text-gray-400" />}
              variant="bordered"
            />
          </div>

          {/* Tabs */}
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
            variant="bordered"
          >
            <Tab key="all" title="All Places" />
            <Tab key="favorites" title="Favorites" />
          </Tabs>
        </div>
      </div>

      {/* Places Grid */}
      {isLoading ? (
        <div className="text-center py-8">
          <p>Loading your places...</p>
        </div>
      ) : filteredPlaces.length === 0 ? (
        <div className="text-center py-12">
          <FaMapMarkerAlt className="mx-auto text-gray-400 text-4xl mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {searchTerm
              ? "No places found"
              : activeTab === "favorites"
              ? "No favorite places yet"
              : "No places saved yet"}
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? "Try a different search term"
              : "Start by adding places on the map!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.map((place) => (
            <Card
              key={place.id}
              isPressable
              onPress={() => handlePlaceClick(place)}
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start w-full">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold line-clamp-1">
                      {place.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {place.is_favorited && (
                      <Chip color="warning" variant="flat" size="sm">
                        Favorite
                      </Chip>
                    )}
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      onPress={(e) => handleFavoriteToggle(place, e)}
                    >
                      {place.is_favorited ? (
                        <FaHeart className="text-red-500" />
                      ) : (
                        <FaRegHeart className="text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardBody className="pt-0">
                {/* Photo */}
                {place.place_photos.length > 0 ? (
                  <div className="aspect-video mb-3 relative">
                    <Image
                      src={getPhotoUrl(place.place_photos[0])}
                      alt={place.title}
                      className="w-full h-full object-cover rounded-lg"
                      loading="lazy"
                    />
                    {place.place_photos.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        +{place.place_photos.length - 1} more
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FaMapMarkerAlt className="text-gray-400 text-2xl" />
                  </div>
                )}

                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {place.description || "No description added yet."}
                </p>

                {/* Metadata */}
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>
                    {place.place_photos.length} photo
                    {place.place_photos.length !== 1 ? "s" : ""}
                  </span>
                  <span>
                    {new Date(place.created_at!).toLocaleDateString()}
                  </span>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Place Details Popover */}
      <PlacePopover
        place={selectedPlace}
        isOpen={isPopoverOpen}
        onClose={handlePopoverClose}
        onPlaceUpdate={handlePlaceUpdate}
        onPlaceDelete={handlePlaceDelete}
        isNewPlace={false}
      />
    </div>
  );
}
