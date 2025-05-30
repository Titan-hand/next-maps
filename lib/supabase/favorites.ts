import { createClient as createServerClient } from "../../utils/supabase/server";
import { createClient as createBrowserClient } from "../../utils/supabase/client";
import { Place } from "../../types/places";

export type PlaceFavorite = {
  id?: string;
  user_id: string;
  place_id: string;
  created_at?: string;
};

export type FavoritePlace = Place & {
  favorite_at: string;
};

// Get the appropriate Supabase client
const getSupabaseClient = () => {
  if (typeof window === "undefined") {
    return createServerClient();
  } else {
    return createBrowserClient();
  }
};

// Toggle (add/remove) a place as favorite
export async function toggleFavorite(
  placeId: string,
  userId: string
): Promise<{ favorite: boolean }> {
  try {
    const supabase = getSupabaseClient();

    // Check if already favorite
    const { data: existingFavorite, error: checkError } = await supabase
      .from("place_favorites")
      .select("id")
      .eq("place_id", placeId)
      .eq("user_id", userId)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingFavorite) {
      // Already favorite - remove it
      const { error: removeError } = await supabase
        .from("place_favorites")
        .delete()
        .eq("id", existingFavorite.id);

      if (removeError) throw removeError;
      return { favorite: false };
    } else {
      // Not favorite - add it
      const { error: addError } = await supabase
        .from("place_favorites")
        .insert({
          place_id: placeId,
          user_id: userId,
        });

      if (addError) throw addError;
      return { favorite: true };
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    throw error;
  }
}

// Check if a place is favorite by a user
export async function isPlaceFavorited(
  placeId: string,
  userId: string
): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();

    // Using the SQL function we created
    const { data, error } = await supabase.rpc("is_place_favorited", {
      place_uuid: placeId,
      user_uuid: userId,
    });

    if (error) throw error;

    return data || false;
  } catch (error) {
    console.error("Error checking if place is favorite:", error);
    return false;
  }
}

// Get all favorite places for a user
export async function getUserFavoritePlaces(
  userId: string
): Promise<FavoritePlace[]> {
  try {
    const supabase = getSupabaseClient();

    // Using the SQL function we created
    const { data, error } = await supabase.rpc("get_user_favorite_places", {
      user_uuid: userId,
    });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error fetching favorite places:", error);
    return [];
  }
}

// Count how many users have favorite a place
export async function getPlaceFavoritesCount(placeId: string): Promise<number> {
  try {
    const supabase = getSupabaseClient();
    const { count, error } = await supabase
      .from("place_favorites")
      .select("id", { count: "exact", head: true })
      .eq("place_id", placeId);

    if (error) throw error;

    return count || 0;
  } catch (error) {
    console.error("Error counting favorites:", error);
    return 0;
  }
}

// Get recently favorite places (useful for discovery features)
export async function getRecentlyFavoritedPlaces(
  limit: number = 10
): Promise<FavoritePlace[]> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("place_favorites")
      .select(
        `
        id,
        created_at as favorite_at,
        places:place_id (*)
      `
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Transform the joined data to match our FavoritePlace type
    const favoritePlaces = data.map((item: any) => ({
      ...item.places,
      favorite_at: item.favorite_at,
    }));

    return favoritePlaces;
  } catch (error) {
    console.error("Error fetching recently favorite places:", error);
    return [];
  }
}
