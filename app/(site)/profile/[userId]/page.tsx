"use client";

import React, { useEffect, useState } from "react";
import { getProfileByUsername } from "@/lib/supabase/profiles";
import { getUserFavoritePlaces } from "@/lib/supabase/favorites";
import { FavoritePlace } from "@/lib/supabase/favorites";
import Image from "next/image";
import Link from "next/link";
import { FaStar, FaMapMarkerAlt } from "react-icons/fa";

interface ProfilePageProps {
  username: string;
}

const ProfilePage = ({ username }: ProfilePageProps) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [favoritePlaces, setFavoritePlaces] = useState<FavoritePlace[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const profileData = await getProfileByUsername(username);

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
  }, [username]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-4">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
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
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gray-200 mb-4 sm:mb-0 sm:mr-6">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.username || "User avatar"}
                fill
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-300 text-gray-600">
                {(profile.username?.charAt(0) || "U").toUpperCase()}
              </div>
            )}
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
            {username === profile.username
              ? "You haven't"
              : `${profile.username} hasn't`}{" "}
            favorited any places yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {favoritePlaces.map((place) => (
            <Link href={`/places/${place.id}`} key={place.id}>
              <div className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className="relative h-48 bg-gray-200">
                  {/* If you have a photo for the place, you could display it here */}
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    <FaMapMarkerAlt className="text-2xl" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 truncate">
                    {place.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {place.description}
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    Favorite on{" "}
                    {new Date(place.favorite_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
