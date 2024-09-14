"use client";
import React, { useState } from "react";
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
} from "@chakra-ui/react";
// Types and interfaces
import { PlaceUploaded } from "@/types";

// Mock data for demonstration purposes
const initialUserData = {
  name: "John Doe",
  bio: "Travel enthusiast and photographer",
  avatar: "https://picsum.photos/200",
};

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

export default function Profile({ isOwner = false }) {
  const [userData, setUserData] = useState(initialUserData);
  const [places, setPlaces] = useState<PlaceUploaded[]>(initialPlaces);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    if (files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserData({ ...userData, avatar: e.target?.result as string });
      };
      reader.readAsDataURL(files[0]);
    }
  };

  return (
    <Box maxWidth="800px" margin="auto" padding={8}>
      <VStack spacing={8} align="stretch">
        <HStack spacing={8}>
          <Box position="relative">
            <Image
              src={userData.avatar}
              alt={userData.name}
              borderRadius="full"
              boxSize="150px"
              objectFit="cover"
            />
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
              />
            )}
          </Box>
          <VStack align="start" flex={1}>
            <Text fontSize="2xl" fontWeight="bold">
              {userData.name}
            </Text>
            <Text>{userData.bio}</Text>
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
