"use client";

import { Box, Heading, Button, VStack, useToast } from "@chakra-ui/react";

export default function Index() {
  const toast = useToast();

  const handleClick = () => {
    toast({
      title: "Hello",
      description: "This is a toast message",
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top",
    });
  };

  return (
    <Box flex={1} display="flex" justifyContent="center" alignItems="center">
      <VStack spacing={7}>
        <Heading>Home page</Heading>
        <Button colorScheme="blue" onClick={handleClick}>
          Click me
        </Button>
      </VStack>
    </Box>
  );
}
