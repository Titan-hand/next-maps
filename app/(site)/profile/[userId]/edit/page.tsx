"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input, Button, Textarea } from "@heroui/react";
import {
  getProfile,
  updateProfile,
  uploadAvatar,
} from "@/lib/supabase/profiles";
import useAuth from "@/hooks/useAuth";
import Image from "next/image";

const ProfileEditPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<{
    username: string;
    full_name: string;
    bio: string;
  }>();

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const profile = await getProfile(user.id);
        if (profile) {
          setValue("username", profile.username || "");
          setValue("full_name", profile.full_name || "");
          setValue("bio", profile.bio || "");

          if (profile.avatar_url) {
            setAvatarPreview(profile.avatar_url);
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, setValue]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: {
    username: string;
    full_name: string;
    bio: string;
  }) => {
    if (!user) return;

    setLoading(true);
    setUpdateSuccess(false);
    setUpdateError(null);

    try {
      // Upload avatar if selected
      if (avatarFile) {
        const avatarResult = await uploadAvatar(user.id, avatarFile);
        if (!avatarResult) {
          throw new Error("Failed to upload avatar");
        }
      }

      // Update profile
      const updatedProfile = await updateProfile(user.id, {
        username: data.username,
        full_name: data.full_name,
        bio: data.bio,
      });

      if (updatedProfile) {
        setUpdateSuccess(true);
        // Refresh form with updated values
        setValue("username", updatedProfile.username || "");
        setValue("full_name", updatedProfile.full_name || "");
        setValue("bio", updatedProfile.bio || "");
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setUpdateError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-4">
        Please log in to edit your profile.
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

      {updateSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Profile updated successfully!
        </div>
      )}

      {updateError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {updateError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Profile Picture
          </label>
          <div className="flex items-center space-x-6">
            <div className="relative w-20 h-20 overflow-hidden rounded-full bg-gray-200">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Avatar preview"
                  fill
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No image
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-violet-50 file:text-violet-700
                hover:file:bg-violet-100"
            />
          </div>
        </div>

        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-2">
            Username
          </label>
          <Input
            id="username"
            disabled={loading}
            {...register("username", {
              required: "Username is required",
              minLength: {
                value: 3,
                message: "Username must be at least 3 characters",
              },
              pattern: {
                value: /^[a-zA-Z0-9_]+$/,
                message:
                  "Username can only contain letters, numbers, and underscores",
              },
            })}
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium mb-2">
            Full Name
          </label>
          <Input id="full_name" disabled={loading} {...register("full_name")} />
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium mb-2">
            Bio
          </label>
          <Textarea id="bio" disabled={loading} rows={4} {...register("bio")} />
        </div>

        <Button
          type="submit"
          disabled={loading}
          color="primary"
          fullWidth
          isLoading={loading}
        >
          Save Profile
        </Button>
      </form>
    </div>
  );
};

export default ProfileEditPage;
