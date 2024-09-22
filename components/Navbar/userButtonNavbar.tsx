import { FiLogOut, FiChevronDown, FiUser } from "react-icons/fi";
import useAuth from "@/hooks/useAuth";
import NextLink from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import { SimpleUser } from "@/types";

export const UserButtonNavbar = () => {
  const supabase = createClient();
  const [userBasicData, setUserBasicData] = useState<SimpleUser | null>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user?.id)
        .returns<SimpleUser[]>();
      if (error) {
        console.error(error);
        return;
      }
      setUserBasicData(data[0]);
    };
    fetchUser();
  }, [user, supabase]);

  return (
    <div className="flex justify-between p-5" id="header-nav-container">
      <div></div>
      <div className="flex justify-end gap-4">
        <div className="relative cursor-pointer">
          <div
            onClick={() => document.getElementById("user-menu")?.classList.toggle("open")}
            className="p-2 rounded-lg transition-all flex items-center"
          >
            <div className="flex items-center">
              <img
                src={userBasicData?.avatar_url || ""}
                alt={user?.email || "User"}
                className="w-8 h-8 rounded-full mr-2"
              />
              <div className="flex flex-col items-start mr-2">
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <FiChevronDown />
            </div>
          </div>
          <div
            id="user-menu"
            className="absolute top-full right-0 bg-white shadow-md rounded-lg z-10 overflow-hidden transition-all"
          >
            <div className="p-2 flex items-center cursor-pointer bg-white">
              <img
                src={userBasicData?.avatar_url || ""}
                alt={user?.email || "User"}
                className="w-12 h-12 rounded-full mr-2"
              />
              <div className="flex flex-col items-start">
                <p className="text-base text-black">
                  {user?.user_metadata.first_name || ""} {user?.user_metadata.last_name || ""}
                </p>
              </div>
            </div>

            <hr className="my-2" />

            <NextLink
              href={`/profile/${user?.id}`}
              className="px-4 py-2 flex items-center gap-2 cursor-pointer text-black"
            >
              <FiUser />
              Profile
            </NextLink>

            <div
              onClick={logout}
              className="px-4 py-2 flex items-center gap-2 cursor-pointer text-black"
            >
              <FiLogOut />
              Sign out
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
