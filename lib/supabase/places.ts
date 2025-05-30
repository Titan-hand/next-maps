import { createClient as createServerClient } from "../../utils/supabase/server";
import { createClient as createBrowserClient } from "../../utils/supabase/client";

// Types
import { Place, PlacePhoto, PlaceComment } from "../../types/places";

// This helper decides which client to use based on environment
const getSupabaseClient = () => {
  // Check if we're running on the server or client
  if (typeof window === "undefined") {
    return createServerClient();
  } else {
    return createBrowserClient();
  }
};

// Place CRUD operations
export async function savePlace(
  place: Place,
  photo?: File
): Promise<Place | null> {
  try {
    const supabase = getSupabaseClient();

    // Insert place data
    const { data, error } = await supabase
      .from("places")
      .insert(place)
      .select()
      .single();

    if (error) throw error;

    // If we have a photo and place was saved successfully
    if (photo && data.id) {
      const fileExt = photo.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `places/${data.id}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("place-photos")
        .upload(filePath, photo);

      if (uploadError) throw uploadError;

      // Save photo reference to database
      const { error: photoError } = await supabase.from("place_photos").insert({
        place_id: data.id,
        storage_path: filePath,
      });

      if (photoError) throw photoError;
    }

    return data;
  } catch (error) {
    console.error("Error saving place:", error);
    return null;
  }
}

export async function getUserPlaces(userId: string): Promise<Place[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("places")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error fetching places:", error);
    return [];
  }
}

export async function getPlacePhotos(placeId: string): Promise<PlacePhoto[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("place_photos")
      .select("*")
      .eq("place_id", placeId);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error fetching place photos:", error);
    return [];
  }
}

export async function getPhotoUrl(path: string): Promise<string | null> {
  try {
    const supabase = getSupabaseClient();
    const { data } = await supabase.storage
      .from("place-photos")
      .getPublicUrl(path);

    if (!data?.publicUrl) throw new Error("No photo URL found");

    return data.publicUrl;
  } catch (error) {
    console.error("Error getting photo URL:", error);
    return null;
  }
}

export async function deletePlace(placeId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();

    // First get all photos for this place
    const photos = await getPlacePhotos(placeId);

    // Delete photos from storage
    for (const photo of photos) {
      await supabase.storage.from("place-photos").remove([photo.storage_path]);
    }

    // Delete photo references from database
    await supabase.from("place_photos").delete().eq("place_id", placeId);

    // Delete the place itself
    const { error } = await supabase.from("places").delete().eq("id", placeId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error deleting place:", error);
    return false;
  }
}

// Comments related functions
export async function addComment(
  comment: PlaceComment
): Promise<PlaceComment | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("place_comments")
      .insert({
        place_id: comment.place_id,
        user_id: comment.user_id,
        comment: comment.comment,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error adding comment:", error);
    return null;
  }
}

export async function getPlaceComments(
  placeId: string
): Promise<PlaceComment[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("place_comments")
      .select(
        `
        *,
        profiles:user_id (
          username,
          avatar_url
        )
      `
      )
      .eq("place_id", placeId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Transform the joined data to match our PlaceComment type
    const comments = data.map((item: any) => ({
      id: item.id,
      place_id: item.place_id,
      user_id: item.user_id,
      comment: item.comment,
      created_at: item.created_at,
      updated_at: item.updated_at,
      user_name: item.profiles?.username || "Anonymous User",
      user_avatar_url: item.profiles?.avatar_url || null,
    }));

    return comments;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}

export async function updateComment(
  id: string,
  comment: string
): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("place_comments")
      .update({ comment, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error updating comment:", error);
    return false;
  }
}

export async function deleteComment(id: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("place_comments")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error deleting comment:", error);
    return false;
  }
}

// Likes related functions
export async function toggleLike(
  placeId: string,
  userId: string
): Promise<{ liked: boolean }> {
  try {
    const supabase = getSupabaseClient();

    // Check if the user already liked this place
    const { data: existingLike, error: checkError } = await supabase
      .from("place_likes")
      .select("id")
      .eq("place_id", placeId)
      .eq("user_id", userId)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingLike) {
      // User already liked - unlike it
      const { error: unlikeError } = await supabase
        .from("place_likes")
        .delete()
        .eq("id", existingLike.id);

      if (unlikeError) throw unlikeError;
      return { liked: false };
    } else {
      // User hasn't liked - add a like
      const { error: likeError } = await supabase.from("place_likes").insert({
        place_id: placeId,
        user_id: userId,
      });

      if (likeError) throw likeError;
      return { liked: true };
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error;
  }
}

export async function getPlaceLikes(placeId: string): Promise<number> {
  try {
    const supabase = getSupabaseClient();
    const { count, error } = await supabase
      .from("place_likes")
      .select("id", { count: "exact", head: true })
      .eq("place_id", placeId);

    if (error) throw error;

    return count || 0;
  } catch (error) {
    console.error("Error counting likes:", error);
    return 0;
  }
}

export async function checkUserLiked(
  placeId: string,
  userId: string
): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("place_likes")
      .select("id")
      .eq("place_id", placeId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;

    return !!data;
  } catch (error) {
    console.error("Error checking if user liked:", error);
    return false;
  }
}

// Get place with statistics (comment count, like count, and favorites count)
export async function getPlaceWithStats(placeId: string): Promise<
  | (Place & {
      likes_count: number;
      comments_count: number;
      favorites_count: number;
    })
  | null
> {
  try {
    const supabase = getSupabaseClient();

    // Get place details
    const { data: place, error: placeError } = await supabase
      .from("places")
      .select("*")
      .eq("id", placeId)
      .single();

    if (placeError) throw placeError;

    // Get likes count
    const likesCount = await getPlaceLikes(placeId);

    // Get comments count
    const { count: commentsCount, error: commentError } = await supabase
      .from("place_comments")
      .select("id", { count: "exact", head: true })
      .eq("place_id", placeId);

    if (commentError) throw commentError;

    // Get favorites count
    const { count: favoritesCount, error: favoritesError } = await supabase
      .from("place_favorites")
      .select("id", { count: "exact", head: true })
      .eq("place_id", placeId);

    if (favoritesError) throw favoritesError;

    return {
      ...place,
      likes_count: likesCount,
      comments_count: commentsCount || 0,
      favorites_count: favoritesCount || 0,
    };
  } catch (error) {
    console.error("Error fetching place with stats:", error);
    return null;
  }
}
