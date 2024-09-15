import {
  Box,
  Flex,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  MenuDivider,
  Avatar,
  AvatarBadge,
  VStack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { FiLogOut, FiChevronDown, FiUser } from "react-icons/fi";
import useAuth from "@/hooks/useAuth";
import NextLink from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import { SimpleUser } from "@/types";

export const UserButtonNavbar = () => {
  const supabase = createClient();
  const [userBasicData, setUserBasicData] = useState<SimpleUser | null>(null);

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
  }, []);

  const { user, logout } = useAuth();
  const disc = useDisclosure();

  return (
    <Flex justify="space-between" p="5" id="header-nav-container">
      <Box />
      <HStack spacing={3} flex="0.5 1 0" justify="flex-end">
        <Menu>
          <MenuButton
            as={Box}
            p="1"
            transition="all 0.2s"
            rounded="md"
            cursor="pointer"
          >
            <HStack alignItems="center">
              <Avatar
                size="sm"
                name={user?.email}
                src={userBasicData?.avatar_url || ""}
              >
                <AvatarBadge boxSize="1.25em" bg="green.500" />
              </Avatar>
              <VStack spacing={0} align="flex-start">
                <Text fontSize="xs" color="gray.500" noOfLines={1}>
                  {user?.email && user?.email}
                </Text>
              </VStack>
              <FiChevronDown color="white" />
            </HStack>
          </MenuButton>
          <MenuList>
            <MenuItem>
              <HStack alignItems="center">
                <Avatar size="md" name={user?.email}>
                  <AvatarBadge boxSize="1.25em" bg="green.500" />
                </Avatar>
                <VStack spacing={0} align="flex-start">
                  <Text fontSize="md" color="black" noOfLines={1}>
                    {user?.user_metadata.first_name || ""}{" "}
                    {user?.user_metadata.last_name || ""}
                  </Text>
                </VStack>
                <FiChevronDown color="white" />
              </HStack>
            </MenuItem>

            <MenuDivider />

            <MenuItem
              as={NextLink}
              href={`/profile/${user?.id}`}
              icon={<FiUser />}
            >
              Profile
            </MenuItem>
            <MenuItem icon={<FiLogOut />} onClick={logout}>
              Sign out
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </Flex>
  );
};
