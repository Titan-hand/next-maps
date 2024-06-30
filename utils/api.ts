import axios from "axios";
import { AddressResponse } from "../types";

export const getAddressFromLatLng = async (lat: number, lng: number): Promise<AddressResponse> => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
  const response = await axios.get(url);
  return response.data;
};

export const getCoordsFromAddress = async (
  address: string
): Promise<{ latitude: number; longitude: number }> => {
  const url = `https://api.geoapify.com/v1/geocode/search?text=${address}&format=json&apiKey=66cd6121abf54dce87b8bc6bc51c02ad`;
  const response = await axios.get(url);
  const data = response.data?.results?.[0];

  return {
    latitude: data?.lat,
    longitude: data?.lon,
  };
};
