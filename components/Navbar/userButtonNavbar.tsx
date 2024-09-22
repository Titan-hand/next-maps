import { FiLogOut, FiChevronDown, FiUser } from "react-icons/fi";
import useAuth from "@/hooks/useAuth";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import { SimpleUser } from "@/types";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Avatar,
} from "@nextui-org/react";

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
    <Dropdown>
      <DropdownTrigger>
        <Button variant="bordered">
          <Avatar
            src={userBasicData?.avatar_url || ""}
            name={userBasicData?.username || ""}
            className="w-6 h-6 text-tiny"
            showFallback
          />
          {user?.email}
          <FiChevronDown />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Dynamic Actions">
        <DropdownItem key="profile" startContent={<FiUser />} href={`/profile/${user?.id}`}>
          Profile
        </DropdownItem>
        <DropdownItem key="sigOut" startContent={<FiLogOut />} onClick={logout}>
          Sign out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
