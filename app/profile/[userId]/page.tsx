"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { FiEdit } from "react-icons/fi";
// Custom hooks
import useStorage from "@/hooks/useStorage";
import useAuth from "@/hooks/useAuth";
import { createClient } from "@/utils/supabase/client";
// Types and interfaces
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
  // Next.js hooks
  const { userId } = useParams();
  // Supabase hooks
  const supabase = createClient();
  const { user } = useAuth();
  const { uploadFile } = useStorage();
  // Local state
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

  // Get user data
  useEffect(() => {
    getUserData();
  }, [getUserData]);

  // Check if the user is the owner of the profile
  useEffect(() => {
    if (userData && user) setIsOwner(user.id === userData.id);
  }, [userData, user]);

  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "8px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <div style={{ position: "relative", overflow: "hidden", cursor: "pointer" }}>
            {/* Avatar Image */}
            <img
              alt={userData?.username || "User"}
              src={userData?.avatar_url || ""}
              style={{ width: "100px", height: "100px", borderRadius: "50%" }}
              onClick={() => setIsModalOpen(true)}
            />

            {/* File Input for Avatar Upload (visible only if user is owner) */}
            {isOwner && (
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{
                  position: "absolute",
                  top: "0",
                  left: "0",
                  opacity: 0,
                  width: "100%",
                  height: "100%",
                  cursor: "pointer",
                  zIndex: 2,
                }}
                onMouseOver={() => setShowAvatarOverlay(true)}
                onMouseLeave={() => setShowAvatarOverlay(false)}
              />
            )}

            {/* Hover Overlay (visible only if user is owner) */}
            {isOwner && (
              <div
                style={{
                  position: "absolute",
                  top: "0",
                  left: "0",
                  width: "100%",
                  height: "100%",
                  backgroundColor: "black",
                  opacity: showAvatarOverlay ? 0.6 : 0,
                  borderRadius: "50%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 1,
                  transition: "opacity 0.3s ease",
                }}
              >
                <FiEdit color="white" size={30} />
              </div>
            )}
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "start" }}>
            <p style={{ fontSize: "2xl", fontWeight: "bold" }}>{userData?.username}</p>
            {isOwner && <button style={{ fontSize: "sm" }}>Add New Place</button>}
          </div>
        </div>

        <div>
          <p style={{ fontSize: "xl", fontWeight: "bold", marginBottom: "16px" }}>My Places</p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >
            {places.map((place) => (
              <div
                key={place.id}
                style={{ borderWidth: "1px", borderRadius: "8px", overflow: "hidden" }}
              >
                <img src={place.image_url} alt={place.name} style={{ width: "100%" }} />
                <div style={{ padding: "16px" }}>
                  <p style={{ fontWeight: "bold" }}>{place.name}</p>
                  <p style={{ fontSize: "sm" }}>{place.description}</p>
                  {isOwner && <button style={{ fontSize: "sm", marginTop: "8px" }}>Edit</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "400px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2>The place</h2>
              <button onClick={() => setIsModalOpen(false)}>X</button>
            </div>
            <div
              style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <input placeholder="Place Name" value={""} />
              <textarea placeholder="Description" value={""} />
              <input placeholder="Image URL" value={""} />
            </div>
            <div
              style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end", gap: "8px" }}
            >
              <button style={{ backgroundColor: "blue", color: "white" }}>Save</button>
              <button onClick={() => setIsModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
