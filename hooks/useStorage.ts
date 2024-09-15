import useAuth from "./useAuth";
import { createClient } from "@/utils/supabase/client";

const bucketName = "bucket1"; // in supabase.

type SupabaseStorageFileResponse = {
  id: string;
  path: string;
  fullPath: string;
} | null;

// Create a custom hook for getting files from supabase and upload a file to supabase
const useStorage = () => {
  const supabase = createClient();
  const { user } = useAuth();

  const uploadFile = async (
    path: string,
    file: File
  ): Promise<SupabaseStorageFileResponse> => {
    if (!user) return null;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(path, file, {
        upsert: true,
      });

    if (error) {
      console.error(error);
      return null;
    } else {
      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucketName).getPublicUrl(data.path);

      return {
        ...data,
        fullPath: publicUrl,
      };
    }
  };

  return {
    uploadFile,
  };
};

export default useStorage;
