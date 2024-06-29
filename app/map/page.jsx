import dynamic from "next/dynamic";

export const LazyMap = dynamic(() => import("./LeafletMap"), { ssr: false });

export default function page() {
  return <div></div>;
}
