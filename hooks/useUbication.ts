"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getAddressFromLatLng, getCoordsFromAddress } from "../utils/api";
import { useGeolocation } from "@uidotdev/usehooks";

const useUbication = (enable = true) => {
  const { latitude, longitude } = useGeolocation();
  const { data: address, ...args } = useQuery({
    queryKey: ["ubication"],
    queryFn: async () => {
      const data = await getAddressFromLatLng(latitude as number, longitude as number);
      return data;
    },
    enabled:
      enable &&
      latitude !== undefined &&
      longitude !== undefined &&
      latitude !== null &&
      longitude !== null,
  });

  const {
    mutateAsync,
    data: coordsData,
    ...mutation
  } = useMutation({
    mutationKey: ["coords"],
    mutationFn: async (address: string) => {
      const coords = await getCoordsFromAddress(address);
      return coords;
    },
    onError(error, variables, context) {
      console.error(error);
    },
  });

  const getCoords = async (address: string) => {
    const coords = await mutateAsync(address);
    return coords;
  };

  return {
    address,
    getCoords,
    coordsData,
    isLoadingCoords: mutation.isPending,
    isCoordsError: mutation.isError,
    ...args,
  };
};

export default useUbication;
