"use client";
import React, { useState, useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Image,
  Tabs,
  Tab,
} from "@heroui/react";
import { FaHeart, FaRegHeart, FaCamera, FaTrash, FaEdit } from "react-icons/fa";
import { usePlaces } from "@/hooks/usePlaces";
import PlaceForm from "./PlaceForm";
import { Tables } from "@/types/supa_database.types";

type Place = Tables<"places">;
type PlacePhoto = Tables<"place_photos">;

interface PlaceWithPhotos extends Place {
  place_photos: PlacePhoto[];
  is_favorited?: boolean;
}

interface PlacePopoverProps {
  place: PlaceWithPhotos | null;
  isOpen: boolean;
  onClose: () => void;
  onPlaceUpdate?: (updatedPlace: Place) => void;
  onPlaceDelete?: (placeId: string) => void;
  isNewPlace?: boolean;
}

export default function PlacePopover({
  place,
  isOpen,
  onClose,
  onPlaceUpdate,
  onPlaceDelete,
  isNewPlace = false,
}: PlacePopoverProps) {
  const {
    updatePlace,
    deletePlace,
    uploadPlacePhoto,
    toggleFavorite,
    isLoading,
  } = usePlaces();

  const [isEditing, setIsEditing] = useState(isNewPlace);
  const [isFavorited, setIsFavorited] = useState(place?.is_favorited || false);
  const [photos, setPhotos] = useState<PlacePhoto[]>(place?.place_photos || []);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when place changes
  React.useEffect(() => {
    if (place) {
      setIsFavorited(place.is_favorited || false);
      setPhotos(place.place_photos || []);
      setIsEditing(isNewPlace);
      if (!isNewPlace) {
        setActiveTab("details");
      }
    }
  }, [place, isNewPlace]);

  const handleFormSubmit = async (formData: {
    title: string;
    description: string;
  }) => {
    if (!place) return;

    const updatedPlace = await updatePlace(place.id, {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
    });

    if (updatedPlace) {
      if (isNewPlace) {
        onClose();
      } else {
        setActiveTab("details");
      }
      onPlaceUpdate?.(updatedPlace);

      // Update local place data
      place.title = updatedPlace.title;
      place.description = updatedPlace.description;
    }
  };

  const handleFormCancel = () => {
    if (isNewPlace) {
      onClose();
    } else {
      setActiveTab("details");
    }
  };

  const handleDelete = async () => {
    if (!place) return;

    const success = await deletePlace(place.id);
    if (success) {
      onPlaceDelete?.(place.id);
      onClose();
    }
  };

  const handleFavoriteToggle = async () => {
    if (!place) return;

    const newFavoriteStatus = await toggleFavorite(place.id);
    setIsFavorited(newFavoriteStatus);
  };

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !place) return;

    setIsUploading(true);
    const newPhoto = await uploadPlacePhoto(place.id, file);

    if (newPhoto) {
      setPhotos((prev) => [...prev, newPhoto]);
    }

    setIsUploading(false);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getPhotoUrl = (photo: PlacePhoto) => {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/bucket1/${photo.storage_path}`;
  };

  if (!place) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeButton={false}
      size="lg"
      scrollBehavior="inside"
      classNames={{
        wrapper: "z-[9999]",
        backdrop: "z-[9998]",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{place.title || "Untitled Place"}</h2>
          </div>

          <div className="flex items-center gap-2">
            <Button isIconOnly variant="light" onPress={handleFavoriteToggle} disabled={isLoading}>
              {isFavorited ? (
                <FaHeart className="text-red-500" />
              ) : (
                <FaRegHeart className="text-gray-400" />
              )}
            </Button>

            {!isNewPlace && (
              <Button
                isIconOnly
                variant="light"
                color="danger"
                onPress={handleDelete}
                disabled={isLoading}
              >
                <FaTrash />
              </Button>
            )}
          </div>
        </ModalHeader>

        <ModalBody className="gap-4">
          {isNewPlace ? (
            // For new places, show only the form
            <div>
              <h3 className="text-lg font-semibold mb-4">Add Place Details</h3>
              <PlaceForm
                initialData={{
                  title: place.title,
                  description: place.description,
                }}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                isLoading={isLoading}
                submitText="Create Place"
              />
            </div>
          ) : (
            // For existing places, show tabs
            <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key as string)}>
              <Tab key="details" title="Details">
                {/* Place Details View */}
                <div className="space-y-4">
                  {/* Description */}
                  <div>
                    <label className="text-sm font-medium text-gray-400 mb-2 block">
                      Description
                    </label>
                    <p className=" min-h-[60px] p-3 rounded-lg bg-[#27272a]">
                      {place.description || "No description added yet."}
                    </p>
                  </div>

                  {/* Location Info */}
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Coordinates:</strong> {place.latitude.toFixed(6)},{" "}
                      {place.longitude.toFixed(6)}
                    </p>
                    {place.zoom_level && (
                      <p className="text-sm text-blue-700">
                        <strong>Zoom Level:</strong> {place.zoom_level}
                      </p>
                    )}
                  </div>
                </div>
              </Tab>

              <Tab key="edit" title="Edit">
                {/* Place Form */}
                <PlaceForm
                  initialData={{
                    title: place.title,
                    description: place.description,
                  }}
                  onSubmit={handleFormSubmit}
                  onCancel={handleFormCancel}
                  isLoading={isLoading}
                  submitText="Update Place"
                />
              </Tab>

              <Tab key="photos" title={`Photos (${photos.length})`}>
                {/* Photos Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">Manage Photos</label>
                    <Button
                      size="sm"
                      variant="bordered"
                      startContent={<FaCamera />}
                      onPress={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      isLoading={isUploading}
                    >
                      {isUploading ? "Uploading..." : "Add Photo"}
                    </Button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />

                  {photos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {photos.map((photo) => (
                        <div key={photo.id} className="aspect-square">
                          <Image
                            src={getPhotoUrl(photo)}
                            alt="Place photo"
                            className="w-full h-full object-cover rounded-lg"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <FaCamera className="mx-auto text-gray-400 text-2xl mb-2" />
                      <p className="text-gray-500 text-sm">No photos yet</p>
                      <p className="text-gray-400 text-xs">Click "Add Photo" to upload images</p>
                    </div>
                  )}
                </div>
              </Tab>
            </Tabs>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>

          {!isNewPlace && activeTab === "details" && (
            <Button
              variant="bordered"
              onPress={() => setActiveTab("edit")}
              startContent={<FaEdit />}
            >
              Edit Place
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
