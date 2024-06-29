"use client"
import dynamic from "next/dynamic";

export const LazyMap = dynamic(() => import("./LeafletMap"), { ssr: false , loading: () => <div>Loading...</div> });

export default function page() {
  return <div><LazyMap/></div>;
}
