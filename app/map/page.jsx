"use client"
import dynamic from "next/dynamic";
import { Box } from "@chakra-ui/react"

export const LazyMap = dynamic(() => import("./LeafletMap"), { ssr: false , loading: () => <div>Loading...</div> });

export default function page() {
  return <Box><LazyMap/></Box>;
}
