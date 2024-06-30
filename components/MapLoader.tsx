"use client";
import { Spinner, Box } from "@chakra-ui/react";

export default function MapLoader() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100dvh" width="100%">
      <Spinner size="xl" color="#3FA2F6" />
    </Box>
  );
}
