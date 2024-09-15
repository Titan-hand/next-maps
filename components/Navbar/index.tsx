import { HStack, Stack, Link as ChakraLink, Box, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { UserButtonNavbar } from "./userButtonNavbar";
import { LoginButtonNavbar } from "./loginButtonNavbar";
import useAuth from "@/hooks/useAuth";
import { HEADER_HEIGHT } from "@/const/stylesConst";
import { useEffect, useState } from "react";

export const Navbar = () => {
  const { user } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!user);
  }, [user]);

  return (
    <HStack
      w="full"
      px={4}
      alignItems="center"
      justifyContent="space-between"
      position="relative"
      zIndex={2}
      height={HEADER_HEIGHT}
    >
      <Text fontSize="xl" fontWeight="bold" zIndex={2}>
        LOGO
      </Text>

      <Stack
        direction={{ md: "row", base: "row", sm: "column" }}
        spacing={4}
        position="absolute"
        left={0}
        right={0}
        display="flex"
        justify="center"
        alignItems="center"
        zIndex={1}
      >
        <ChakraLink as={NextLink} href="/map">
          Map
        </ChakraLink>
        <ChakraLink as={NextLink} href="/about">
          About
        </ChakraLink>
      </Stack>

      <Box zIndex={2}>
        {isLoggedIn ? <UserButtonNavbar /> : <LoginButtonNavbar />}
      </Box>
    </HStack>
  );
};
