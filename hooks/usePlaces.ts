import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/types/supa_database.types";
import useAuth from "./useAuth";
import useStorage from "./useStorage";

type Place = Tables<"places">;
type PlaceInsert = TablesInsert<"places">;
type PlaceUpdate = TablesUpdate<"places">;
type PlacePhoto = Tables<"place_photos">;
type PlaceFavorite = Tables<"place_favorites">;

interface PlaceWithPhotos extends Place {
  place_photos: PlacePhoto[];
  is_favorited?: boolean;
}

export const usePlaces = () => {
  const supabase = createClient();
  const { user } = useAuth();
  const { uploadFile } = useStorage();

  const [places, setPlaces] = useState<PlaceWithPhotos[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new place
  const createPlace = useCallback(
    async (
      placeData: Omit<PlaceInsert, "user_id" | "id">
    ): Promise<PlaceWithPhotos | null> => {
      if (!user) return null;

      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("places")
          .insert({
            ...placeData,
            user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;

        // Create PlaceWithPhotos object
        const placeWithPhotos: PlaceWithPhotos = {
          ...data,
          place_photos: [],
          is_favorited: false,
        };

        // Add to local state immediately
        setPlaces((prev) => [placeWithPhotos, ...prev]);

        return placeWithPhotos;
      } catch (err) {
        setError((err as Error).message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, user]
  );

  // Update a place
  const updatePlace = useCallback(
    async (placeId: string, updates: PlaceUpdate): Promise<Place | null> => {
      if (!user) return null;

      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("places")
          .update(updates)
          .eq("id", placeId)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) throw error;

        // Update local state
        setPlaces((prev) =>
          prev.map((place) =>
            place.id === placeId ? { ...place, ...updates } : place
          )
        );

        return data;
      } catch (err) {
        setError((err as Error).message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, user]
  );

  // Delete a place
  const deletePlace = useCallback(
    async (placeId: string): Promise<boolean> => {
      if (!user) return false;

      setIsLoading(true);
      setError(null);

      try {
        const { error } = await supabase
          .from("places")
          .delete()
          .eq("id", placeId)
          .eq("user_id", user.id);

        if (error) throw error;

        // Remove from local state
        setPlaces((prev) => prev.filter((place) => place.id !== placeId));

        return true;
      } catch (err) {
        setError((err as Error).message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, user]
  );

  // Upload place photo
  const uploadPlacePhoto = useCallback(
    async (placeId: string, file: File): Promise<PlacePhoto | null> => {
      if (!user) return null;

      setIsLoading(true);
      setError(null);

      try {
        // Generate unique file path
        const fileExtension = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${fileExtension}`;
        const filePath = `places/${placeId}/${fileName}`;

        // Upload file
        const uploadResult = await uploadFile(filePath, file);
        if (!uploadResult) throw new Error("Failed to upload file");

        // Save photo record to database
        const { data, error } = await supabase
          .from("place_photos")
          .insert({
            place_id: placeId,
            storage_path: uploadResult.path,
          })
          .select()
          .single();

        if (error) throw error;

        return data;
      } catch (err) {
        setError((err as Error).message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, user, uploadFile]
  );

  // Toggle favorite status
  const toggleFavorite = useCallback(
    async (placeId: string): Promise<boolean> => {
      if (!user) return false;

      setIsLoading(true);
      setError(null);

      try {
        // Check if already favorited
        const { data: existingFavorite } = await supabase
          .from("place_favorites")
          .select("id")
          .eq("place_id", placeId)
          .eq("user_id", user.id)
          .single();

        let newFavoriteStatus: boolean;

        if (existingFavorite) {
          // Remove favorite
          const { error } = await supabase
            .from("place_favorites")
            .delete()
            .eq("place_id", placeId)
            .eq("user_id", user.id);

          if (error) throw error;
          newFavoriteStatus = false;
        } else {
          // Add favorite
          const { error } = await supabase.from("place_favorites").insert({
            place_id: placeId,
            user_id: user.id,
          });

          if (error) throw error;
          newFavoriteStatus = true;
        }

        // Update local state
        setPlaces((prev) =>
          prev.map((place) =>
            place.id === placeId
              ? { ...place, is_favorited: newFavoriteStatus }
              : place
          )
        );

        return newFavoriteStatus;
      } catch (err) {
        setError((err as Error).message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, user]
  );

  // Get all places with photos and favorite status
  const fetchUserPlaces = useCallback(async (): Promise<void> => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("places")
        .select(
          `
          *,
          place_photos (*),
          place_favorites (id)
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const placesWithPhotos: PlaceWithPhotos[] = data.map((place) => ({
        ...place,
        place_photos: place.place_photos || [],
        is_favorited: place.place_favorites && place.place_favorites.length > 0,
      }));

      setPlaces(placesWithPhotos);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user]);

  // Get place by ID with photos and favorite status
  const getPlaceById = useCallback(
    async (placeId: string): Promise<PlaceWithPhotos | null> => {
      if (!user) return null;

      try {
        const { data, error } = await supabase
          .from("places")
          .select(
            `
          *,
          place_photos (*),
          place_favorites (id)
        `
          )
          .eq("id", placeId)
          .single();

        if (error) throw error;

        return {
          ...data,
          place_photos: data.place_photos || [],
          is_favorited: data.place_favorites && data.place_favorites.length > 0,
        };
      } catch (err) {
        setError((err as Error).message);
        return null;
      }
    },
    [supabase, user]
  );

  // Load places on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchUserPlaces();
    } else {
      setPlaces([]);
    }
  }, [user, fetchUserPlaces]);

  return {
    places,
    isLoading,
    error,
    createPlace,
    updatePlace,
    deletePlace,
    uploadPlacePhoto,
    toggleFavorite,
    fetchUserPlaces,
    getPlaceById,
  };
};
