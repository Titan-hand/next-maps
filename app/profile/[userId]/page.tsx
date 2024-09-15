"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Image,
  Button,
  Input,
  Textarea,
  SimpleGrid,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Avatar,
} from "@chakra-ui/react";
// Custom hooks
import useStorage from "@/hooks/useStorage";
import useAuth from "@/hooks/useAuth";
import { createClient } from "@/utils/supabase/client";
// Types and interfaces
import { PlaceUploaded, SimpleUser } from "@/types";
import { useParams } from "next/navigation";
import { FiEdit } from "react-icons/fi";

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
  // Chakra hooks
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    if (files[0]) {
      try {
        setIsUploadingImage(true);
        const data = await uploadFile(
          `avatars/${user?.id}.${files[0].name}`,
          files[0]
        );
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
  }, [userId, setLoadingUserData]);

  // Get user data
  useEffect(() => {
    getUserData();
  }, [getUserData]);

  // Check if the user is the owner of the profile
  useEffect(() => {
    if (userData && user) setIsOwner(user.id === userData.id);
  }, [userData, user]);

  return (
    <Box maxWidth="800px" margin="auto" padding={8}>
      <VStack spacing={8} align="stretch">
        <HStack spacing={8}>
          <Box position="relative" overflow="hidden" cursor="pointer">
            {/* Avatar Image */}
            <Avatar
              name={userData?.username || "User"}
              src={userData?.avatar_url || ""}
              size="xl"
              onClick={onOpen}
            />

            {/* File Input for Avatar Upload (visible only if user is owner) */}
            {isOwner && (
              <Input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                position="absolute"
                top="0"
                left="0"
                opacity="0"
                width="100%"
                height="100%"
                cursor="pointer"
                zIndex="2"
                onMouseOver={() => setShowAvatarOverlay(true)}
                onMouseLeave={() => setShowAvatarOverlay(false)}
              />
            )}

            {/* Hover Overlay (visible only if user is owner) */}
            {isOwner && (
              <Box
                position="absolute"
                top="0"
                left="0"
                width="100%"
                height="100%"
                bg="black"
                opacity={showAvatarOverlay ? 0.6 : 0}
                borderRadius="50%"
                display="flex"
                justifyContent="center"
                alignItems="center"
                zIndex="1"
                transition="opacity 0.3s ease"
              >
                <FiEdit color="white" size={30} />
              </Box>
            )}
          </Box>

          <VStack align="start" flex={1}>
            <Text fontSize="2xl" fontWeight="bold">
              {userData?.username}
            </Text>
            {isOwner && <Button size="sm">Add New Place</Button>}
          </VStack>
        </HStack>

        <Box>
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            My Places
          </Text>
          <SimpleGrid columns={[1, 2, 3]} spacing={4}>
            {places.map((place) => (
              <Box
                key={place.id}
                borderWidth={1}
                borderRadius="lg"
                overflow="hidden"
              >
                <Image src={place.image_url} alt={place.name} />
                <Box p={4}>
                  <Text fontWeight="bold">{place.name}</Text>
                  <Text fontSize="sm">{place.description}</Text>
                  {isOwner && (
                    <Button size="sm" mt={2}>
                      Edit
                    </Button>
                  )}
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>The place</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Input placeholder="Place Name" value={""} />
              <Textarea placeholder="Description" value={""} />
              <Input placeholder="Image URL" value={""} />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3}>
              Save
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
