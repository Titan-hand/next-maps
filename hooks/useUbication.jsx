"use client";
import { useQuery } from "@tanstack/react-query";
import { getAddressFromLatLng } from "../utils/api";
import { useGeolocation } from "@uidotdev/usehooks";
const useUbication = () => {
  const { latitude, longitude } = useGeolocation();
  const { data: address, ...args } = useQuery({
    queryKey: ["ubication"],
    queryFn: async () => {
      const data = await getAddressFromLatLng(latitude, longitude);
      return data;
    },
    enabled: latitude !== undefined && longitude !== undefined && latitude !== null && longitude !== null,
  });

  return { address, ...args };
};

export default useUbication;
