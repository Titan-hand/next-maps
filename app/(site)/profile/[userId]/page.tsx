"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  getProfileByUsername,
  getProfile,
  uploadAvatar,
} from "@/lib/supabase/profiles";
import { getUserFavoritePlaces } from "@/lib/supabase/favorites";
import { FavoritePlace } from "@/lib/supabase/favorites";
import Image from "next/image";
import {
  FaStar,
  FaMapMarkerAlt,
  FaCamera,
  FaEdit,
  FaTimes,
} from "react-icons/fa";
import useAuth from "@/hooks/useAuth";
import PlacePopover from "@/components/PlacePopover";

interface ProfilePageProps {
  params: {
    userId: string;
  };
}

const ProfilePage = ({ params }: ProfilePageProps) => {
  const { userId } = params;
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [favoritePlaces, setFavoritePlaces] = useState<FavoritePlace[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if current user can edit this profile
  const canEdit = user && profile && user.id === profile.id;

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        let profileData = null;

        // First try to get profile by username (assuming userId is a username)
        try {
          profileData = await getProfileByUsername(userId);
        } catch (error) {
          console.log(
            "Failed to get profile by username, trying by ID:",
            error
          );
        }

        // If that fails, try by user ID (in case userId is actually a UUID)
        if (!profileData) {
          try {
            profileData = await getProfile(userId);
          } catch (error) {
            console.log("Failed to get profile by ID:", error);
          }
        }

        if (!profileData) {
          setError("Profile not found");
          return;
        }

        setProfile(profileData);

        // Load favorite places
        if (profileData.id) {
          const places = await getUserFavoritePlaces(profileData.id);
          setFavoritePlaces(places);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        setError("Error loading profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  const handleAvatarClick = () => {
    if (canEdit) {
      fileInputRef.current?.click();
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user || !profile) return;

    setIsUploadingAvatar(true);
    try {
      const result = await uploadAvatar(user.id, file);
      if (result) {
        setProfile({ ...profile, avatar_url: result.avatar_url });
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handlePlaceClick = (place: FavoritePlace) => {
    // Convert FavoritePlace to the format expected by PlacePopover
    const placeWithPhotos = {
      ...place,
      place_photos: [], // You might want to fetch photos if available
      is_favorited: true, // Since it's from favorites
    };
    setSelectedPlace(placeWithPhotos);
    setIsPlaceModalOpen(true);
  };

  const formatFavoriteDate = (dateString: string) => {
    try {
      if (!dateString) return "Unknown date";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Unknown date";
      return date.toLocaleDateString();
    } catch (error) {
      return "Unknown date";
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-4">
        <div className="animate-pulse">
          {/* Profile Header Skeleton */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="flex flex-col sm:flex-row items-center">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200 mb-4 sm:mb-0 sm:mr-6"></div>
              <div className="text-center sm:text-left flex-1">
                <div className="h-8 bg-gray-200 rounded w-48 mb-2 mx-auto sm:mx-0"></div>
                <div className="h-5 bg-gray-200 rounded w-32 mb-2 mx-auto sm:mx-0"></div>
                <div className="h-4 bg-gray-200 rounded w-64 mb-4 mx-auto sm:mx-0"></div>
                <div className="h-4 bg-gray-200 rounded w-40 mx-auto sm:mx-0"></div>
              </div>
            </div>
          </div>

          {/* Title Skeleton */}
          <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>

          {/* Places Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white shadow rounded-lg overflow-hidden"
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || "Error loading profile"}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-center">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gray-200 mb-4 sm:mb-0 sm:mr-6 group">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.username || "User avatar"}
                fill
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-300 text-gray-600 text-xl font-semibold">
                {(profile.username?.charAt(0) || "U").toUpperCase()}
              </div>
            )}

            {/* Avatar Upload Overlay */}
            {canEdit && (
              <div
                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={handleAvatarClick}
              >
                {isUploadingAvatar ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  <FaCamera className="text-white text-xl" />
                )}
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>

          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold">
              {profile.full_name || profile.username}
            </h1>
            {profile.full_name && (
              <p className="text-gray-500 mb-2">@{profile.username}</p>
            )}
            {profile.bio && <p className="text-gray-700 mt-2">{profile.bio}</p>}
            <p className="text-gray-500 mt-4">
              <FaStar className="inline mr-1" />
              {favoritePlaces.length} favorite place
              {favoritePlaces.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Favorite Places</h2>

      {favoritePlaces.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <FaMapMarkerAlt className="text-gray-400 text-5xl mx-auto mb-4" />
          <p className="text-gray-600">
            {canEdit ? "You haven't" : `${profile.username} hasn't`} favorited
            any places yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {favoritePlaces.map((place) => (
            <div
              key={place.id}
              onClick={() => handlePlaceClick(place)}
              className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full"
            >
              <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100">
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  <FaMapMarkerAlt className="text-2xl" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 truncate">
                  {place.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                  {place.description || "No description available"}
                </p>
                <div className="mt-2 text-xs text-gray-500">
                  Favorited on {formatFavoriteDate(place.favorited_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Place Modal */}
      <PlacePopover
        place={selectedPlace}
        isOpen={isPlaceModalOpen}
        onClose={() => {
          setIsPlaceModalOpen(false);
          setSelectedPlace(null);
        }}
        onPlaceUpdate={(updatedPlace) => {
          // Optionally update the place in the favorites list
          setFavoritePlaces((prev) =>
            prev.map((p) =>
              p.id === updatedPlace.id ? { ...p, ...updatedPlace } : p
            )
          );
        }}
        onPlaceDelete={(placeId) => {
          // Remove from favorites list
          setFavoritePlaces((prev) => prev.filter((p) => p.id !== placeId));
        }}
      />
    </div>
  );
};

export default ProfilePage;
