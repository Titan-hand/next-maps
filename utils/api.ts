import axios from "axios";
import { AddressResponse } from "../types";

export const getAddressFromLatLng = async (lat: number, lng: number): Promise<AddressResponse> => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
  const response = await axios.get(url);
  return response.data;
};