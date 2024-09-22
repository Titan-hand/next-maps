"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { FiEdit } from "react-icons/fi";
import useStorage from "@/hooks/useStorage";
import useAuth from "@/hooks/useAuth";
import { createClient } from "@/utils/supabase/client";
import { PlaceUploaded, SimpleUser } from "@/types";

const initialPlaces: PlaceUploaded[] = [
  {
    id: "1",
    uploaded_by_user_id: "1",
    name: "Eiffel Tower",
    description: "Iconic iron tower in Paris",
    image_url: "https://picsum.photos/200",
  },
  {
    id: "2",
    uploaded_by_user_id: "1",
    name: "Grand Canyon",
    description: "Vast canyon in Arizona",
    image_url: "https://picsum.photos/200",
  },
];

export default function Profile() {
  const { userId } = useParams();
  const supabase = createClient();
  const { user } = useAuth();
  const { uploadFile } = useStorage();
  const [isOwner, setIsOwner] = useState(false);
  const [userData, setUserData] = useState<SimpleUser | null>(null);
  const [loadingUserData, setLoadingUserData] = useState<boolean>(false);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [places, setPlaces] = useState<PlaceUploaded[]>(initialPlaces);
  const [showAvatarOverlay, setShowAvatarOverlay] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    if (files[0]) {
      try {
        setIsUploadingImage(true);
        const data = await uploadFile(`avatars/${user?.id}.${files[0].name}`, files[0]);
        if (data) {
          const { error } = await supabase
            .from("users")
            .update({
              avatar_url: data.fullPath,
            })
            .eq("id", user?.id);
          if (error) {
            console.error(error);
            return;
          }

          setUserData((prev) => ({ ...prev!, avatar_url: data.fullPath }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const getUserData = useCallback(async () => {
    try {
      setLoadingUserData(true);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .returns<SimpleUser[]>();
      if (error) {
        console.error(error);
        return;
      }
      setUserData(data[0]);
    } catch (error) {
    } finally {
      setLoadingUserData(false);
    }
  }, [userId]);

  useEffect(() => {
    getUserData();
  }, [getUserData]);

  useEffect(() => {
    if (userData && user) setIsOwner(user.id === userData.id);
  }, [userData, user]);

  return (
    <div className="max-w-[800px] mx-auto p-2">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="relative overflow-hidden cursor-pointer">
            <img
              alt={userData?.username || "User"}
              src={userData?.avatar_url || ""}
              className="w-[100px] h-[100px] rounded-full"
              onClick={() => setIsModalOpen(true)}
            />

            {isOwner && (
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="absolute top-0 left-0 opacity-0 w-full h-full cursor-pointer z-10"
                onMouseOver={() => setShowAvatarOverlay(true)}
                onMouseLeave={() => setShowAvatarOverlay(false)}
              />
            )}

            {isOwner && (
              <div
                className={`absolute top-0 left-0 w-full h-full bg-black ${
                  showAvatarOverlay ? "opacity-60" : "opacity-0"
                } rounded-full flex justify-center items-center z-0 transition-opacity duration-300`}
              >
                <FiEdit color="white" size={30} />
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col items-start">
            <p className="text-2xl font-bold">{userData?.username}</p>
            {isOwner && <button className="text-sm">Add New Place</button>}
          </div>
        </div>

        <div>
          <p className="text-xl font-bold mb-4">My Places</p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
            {places.map((place) => (
              <div key={place.id} className="border border-gray-300 rounded-lg overflow-hidden">
                <img src={place.image_url} alt={place.name} className="w-full" />
                <div className="p-4">
                  <p className="font-bold">{place.name}</p>
                  <p className="text-sm">{place.description}</p>
                  {isOwner && <button className="text-sm mt-2">Edit</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.5)] flex justify-center items-center">
          <div className="bg-white p-5 rounded-lg w-[400px]">
            <div className="flex justify-between items-center">
              <h2>The place</h2>
              <button onClick={() => setIsModalOpen(false)}>X</button>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <input placeholder="Place Name" value={""} />
              <textarea placeholder="Description" value={""} />
              <input placeholder="Image URL" value={""} />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="bg-blue-500 text-white">Save</button>
              <button onClick={() => setIsModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
