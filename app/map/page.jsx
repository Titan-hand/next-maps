"use client";
import dynamic from "next/dynamic";
import { Box } from "@chakra-ui/react"
import MapLoader from "@/components/MapLoader";

export const LazyMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => <MapLoader />,
});

export default function page() {
  return (
    <Box flex={1}>
      <LazyMap/>
    </Box>
  );
}
