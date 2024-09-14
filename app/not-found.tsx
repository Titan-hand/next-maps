"use client";
import { Box, Heading, Text, Button } from "@chakra-ui/react";
import Link from "next/link";

const NotFound = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minH="100vh"
    >
      <Heading>404: Not Found</Heading>
      <Text>You just hit a route that doesn&#39;t exist... the sadness.</Text>

      <Button as={Link} href="/" variant="outline" colorScheme="blue" mt={3}>
        Go back home
      </Button>
    </Box>
  );
};

export default NotFound;
