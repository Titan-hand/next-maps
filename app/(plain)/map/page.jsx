"use client";
import dynamic from "next/dynamic";
import MapLoader from "@/components/MapLoader";

export const LazyMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => <MapLoader />,
});

export default function Page() {
  return (
    <div flex={1}>
      <LazyMap />
    </div>
  );
}
