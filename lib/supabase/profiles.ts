import { createClient as createServerClient } from "../../utils/supabase/server";
import { createClient as createBrowserClient } from "../../utils/supabase/client";

export type Profile = {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
};

// Get the appropriate Supabase client
const getSupabaseClient = () => {
  if (typeof window === "undefined") {
    return createServerClient();
  } else {
    return createBrowserClient();
  }
};

// Get a user's profile
export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      // Handle the specific case where no rows are found
      if (error.code === "PGRST116") {
        console.log(`No profile found for user ID: ${userId}`);
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

// Update a user's profile
export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<Profile | null> {
  try {
    const supabase = getSupabaseClient();

    // Remove id from updates if it exists
    if (updates.id) {
      delete updates.id;
    }

    // Don't allow updating timestamps
    if (updates.created_at) delete updates.created_at;
    if (updates.updated_at) delete updates.updated_at;

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error updating profile:", error);
    return null;
  }
}

// Upload a profile avatar
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<{ avatar_url: string } | null> {
  try {
    const supabase = getSupabaseClient();

    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = await supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    // Update profile with avatar URL
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: data.publicUrl })
      .eq("id", userId);

    if (updateError) throw updateError;

    return { avatar_url: data.publicUrl };
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return null;
  }
}

// Get public profile by username
export async function getProfileByUsername(
  username: string
): Promise<Profile | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single();

    if (error) {
      // Handle the specific case where no rows are found
      if (error.code === "PGRST116") {
        console.log(`No profile found for username: ${username}`);
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching profile by username:", error);
    return null;
  }
}
