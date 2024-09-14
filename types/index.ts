import { User as SupabaseUser } from "@supabase/supabase-js";
// ##### MAPS #####

interface Address {
  house_number: string;
  road: string;
  neighbourhood: string;
  borough: string;
  city: string;
  county: string;
  province: string;
  "ISO3166-2-lvl6": string;
  state: string;
  "ISO3166-2-lvl4": string;
  postcode: string;
  country: string;
  country_code: string;
}

interface Location {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  category: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name: string;
  display_name: string;
  address: Address;
  boundingbox: [string, string, string, string];
}

interface AddressResponse extends Location {
  address: Address;
}

export interface PlaceUploaded {
  id: string;
  name: string;
  uploaded_by_user_id: string;
  description?: string;
  image_url?: string;
}

export type { AddressResponse };

// ##### USER #####

type User = SupabaseUser;

export type { User };
