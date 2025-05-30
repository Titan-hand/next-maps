import { FiLogOut, FiChevronDown, FiUser } from "react-icons/fi";
import useAuth from "@/hooks/useAuth";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Avatar,
} from "@heroui/react";

export const UserButtonNavbar = () => {
  const supabase = createClient();
  const [userBasicData, setUserBasicData] = useState<User | null>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user?.id)
        .returns<User[]>();
      if (error) {
        console.error(error);
        return;
      }
      setUserBasicData(data[0]);
    };
    fetchUser();
  }, [user, supabase]);

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="bordered">
          <Avatar
            src={userBasicData?.user_metadata?.avatar_url || ""}
            name={userBasicData?.email || ""}
            className="w-6 h-6 text-tiny"
            showFallback
          />
          {user?.email}
          <FiChevronDown />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Dynamic Actions">
        <DropdownItem
          key="profile"
          startContent={<FiUser />}
          href={`/profile/${user?.id}`}
        >
          Profile
        </DropdownItem>
        <DropdownItem key="sigOut" startContent={<FiLogOut />} onClick={logout}>
          Sign out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
