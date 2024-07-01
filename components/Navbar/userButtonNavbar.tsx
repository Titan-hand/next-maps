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
import { FiLogOut, FiSettings, FiChevronDown } from "react-icons/fi";
import useAuth from "@/hooks/useAuth";

export const UserButtonNavbar = () => {
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
              <Avatar size="sm" name={user?.email}>
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

            <MenuItem icon={<FiSettings />} onClick={disc.onOpen}>
              Settings
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
