"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { FiEdit } from "react-icons/fi";
import useStorage from "@/hooks/useStorage";
import useAuth from "@/hooks/useAuth";
import { createClient } from "@/utils/supabase/client";
import { PlaceUploaded, SimpleUser } from "@/types";
import { Card, CardBody, CardFooter, Image, Button, Pagination } from "@nextui-org/react";
import usePagination from "@/hooks/usePagination";

const initialPlaces = Array.from({ length: 102 }, (_, index) => {
  const id = (index + 1).toString();
  return {
    id,
    uploaded_by_user_id: "1",
    name: `Place ${id}`,
    description: `Description for place ${id}`,
    image_url: `https://picsum.photos/${200 + (index % 800)}`,
  };
});

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
  const { data, nextPage, previousPage , totalPages, setPage, currentPage} = usePagination(initialPlaces, 12);

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
    <div className="max-w-[700px] w-full mx-auto p-2">
      <div className="flex flex-col w-full gap-2">
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
        <Button onClick={nextPage}>Siguiente</Button>
        <Button onClick={previousPage}>anterior</Button>
        <div className="gap-2 grid grid-cols-2 sm:grid-cols-3 mt-10">
          {data.map((item, index) => (
            /* eslint-disable no-console */
            <Card
              key={index}
              isPressable
              shadow="sm"
              className="mb-2"
              onPress={() => console.log("item pressed")}
            >
              <CardBody className="overflow-visible p-0">
                <Image
                  alt={item.name}
                  className="w-full object-cover h-[140px]"
                  radius="lg"
                  shadow="sm"
                  src={item.image_url}
                  width="100%"
                />
              </CardBody>
              <CardFooter className="text-small items-start flex-col">
                <b>{item.name}</b>
                <p className="text-default-500 text-xs mt-1">{item.description}</p>
              </CardFooter>
            </Card>
          ))}
        </div>
        <Pagination
          page={currentPage}
          onChange={setPage}
          total={totalPages}
          className="my-5"
          classNames={{
            wrapper: "w-full max-w-full justify-center",
          }}
        />
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
