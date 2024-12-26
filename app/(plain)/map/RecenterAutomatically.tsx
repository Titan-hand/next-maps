import { useMap } from "react-leaflet";
import { useEffect, useState } from "react";

const RecenterAutomatically = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();

  useEffect(() => {
    if (lat !== undefined && lng !== undefined) {
      map.setView([lat, lng]);
    }
  }, [lat, lng]);

  return null;
};

export default RecenterAutomatically;
