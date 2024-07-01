import { Link as ChakraLink, Button } from "@chakra-ui/react";
import NextLink from "next/link";

export const LoginButtonNavbar = () => {
  return (
    <ChakraLink as={NextLink} href="/login">
      <Button colorScheme="blue">Login</Button>
    </ChakraLink>
  );
};
