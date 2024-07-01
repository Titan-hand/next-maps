"use client";
import { Box } from "@chakra-ui/react";
import { use100vh } from "react-div-100vh";
import { Navbar } from "@/components/Navbar";
import { APP_BACKGROUND_COLOR } from "@/const/stylesConst";

export const CustomLayout = ({ children }: { children: React.ReactNode }) => {
  const height = use100vh();

  return (
    <Box
      minH={height + "px"}
      display="flex"
      flexDirection="column"
      w="full"
      bg={APP_BACKGROUND_COLOR}
    >
      <Navbar />
      {children}
    </Box>
  );
};
