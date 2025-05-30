import { Database } from "./supa_database.types";

export type Place = Database["public"]["Tables"]["places"]["Row"];

export type PlacePhoto = Database["public"]["Tables"]["place_photos"]["Row"];

export type PlaceComment =
  Database["public"]["Tables"]["place_comments"]["Row"];

export type PlaceLike = Database["public"]["Tables"]["place_likes"]["Row"];
