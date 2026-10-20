import {
  Button,
  useDisclosure,
  Input,
  Box,
  Text,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Tooltip,
  Avatar,
  useToast,
  Spinner,
  Flex,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";

import {
  BellIcon,
  ChevronDownIcon,
  SearchIcon,
  CloseIcon,
} from "@chakra-ui/icons";

import { useHistory } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import ChatLoading from "../ChatLoading";
import ProfileModal from "./ProfileModal";
import { getSender } from "../../config/ChatLogics";
import UserListItem from "../userAvatar/UserListItem";
import { ChatState } from "../../context/ChatProvider";

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState("");

  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const history = useHistory();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  };

  // Automatically search after the user pauses typing.
  useEffect(() => {
    const query = search.trim();

    if (!isOpen || !query) {
      setSearchResult([]);
      setSearched(false);
      setSearchError("");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setSearchError("");

        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };

        const { data } = await axios.get(
          `/api/user?search=${encodeURIComponent(query)}`,
          config,
        );

        if (!cancelled) {
          setSearchResult(Array.isArray(data) ? data : []);
          setSearched(true);
        }
      } catch (error) {
        if (!cancelled) {
          setSearchResult([]);
          setSearched(true);
          setSearchError(
            error?.response?.data?.message ||
              "Unable to search users. Please try again.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, isOpen, user?.token]);

  const accessChat = async (userId) => {
    if (!userId || !user?.token) return;

    try {
      setLoadingChat(true);

      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post("/api/chat", { userId }, config);

      if (!chats.some((chat) => chat._id === data._id)) {
        setChats((prev) => [data, ...prev]);
      }

      setSelectedChat(data);
      setSearch("");
      setSearchResult([]);
      setSearched(false);
      onClose();
    } catch (error) {
      toast({
        title: "Unable to open conversation",
        description:
          error?.response?.data?.message ||
          error.message ||
          "Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "bottom",
      });
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <>
      <Flex
        as="header"
        align="center"
        justify="space-between"
        position="relative"
        w="100%"
        minH="76px"
        px={{ base: 3, md: 6 }}
        py={3}
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.200"
        boxShadow="sm"
        flexShrink={0}
      >
        {/* Left: Search */}
        <Box flex="1" display="flex" justifyContent="flex-start">
          <Tooltip label="Find people on Vibely" hasArrow>
            <Button
              onClick={onOpen}
              variant="ghost"
              colorScheme="teal"
              leftIcon={<SearchIcon />}
              borderRadius="xl"
            >
              <Text display={{ base: "none", sm: "block" }}>Search users</Text>
            </Button>
          </Tooltip>
        </Box>

        {/* Center: Brand */}
        <Text
          position="absolute"
          left="50%"
          transform="translateX(-50%)"
          fontSize={{ base: "xl", md: "2xl" }}
          fontWeight="800"
          letterSpacing="-0.5px"
          color="teal.600"
          userSelect="none"
        >
          Vibely
        </Text>

        {/* Right: Notifications and profile */}
        <Flex flex="1" justify="flex-end" align="center" gap={2}>
          <Menu>
            <Tooltip label="Notifications">
              <MenuButton
                as={IconButton}
                aria-label="Notifications"
                icon={<BellIcon />}
                variant="ghost"
                borderRadius="xl"
                position="relative"
              />
            </Tooltip>

            {notification.length > 0 && (
              <Box
                position="absolute"
                top="12px"
                right={{ base: "88px", md: "104px" }}
                bg="red.500"
                color="white"
                borderRadius="full"
                minW="18px"
                h="18px"
                fontSize="xs"
                display="flex"
                alignItems="center"
                justifyContent="center"
                pointerEvents="none"
                zIndex={2}
              >
                {notification.length}
              </Box>
            )}

            <MenuList>
              {notification.length === 0 ? (
                <MenuItem isDisabled>No new messages</MenuItem>
              ) : (
                notification.map((notif) => (
                  <MenuItem
                    key={notif._id}
                    onClick={() => {
                      setSelectedChat(notif.chat);
                      setNotification((prev) =>
                        prev.filter((item) => item._id !== notif._id),
                      );
                    }}
                  >
                    {notif.chat.isGroupChat
                      ? `New message in ${notif.chat.chatName}`
                      : `New message from ${getSender(user, notif.chat.users)}`}
                  </MenuItem>
                ))
              )}
            </MenuList>
          </Menu>

          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              rightIcon={<ChevronDownIcon />}
              borderRadius="xl"
              px={2}
            >
              <Avatar size="sm" name={user?.name} src={user?.pic} />
            </MenuButton>

            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Log out</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>

      {/* User search drawer */}
      <Drawer
        placement="left"
        onClose={() => {
          onClose();
          setSearch("");
        }}
        isOpen={isOpen}
        size={{ base: "full", sm: "sm", md: "md" }}
      >
        <DrawerOverlay bg="blackAlpha.500" />

        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px" borderColor="gray.100" py={5}>
            <Flex align="center" gap={3}>
              <Flex
                align="center"
                justify="center"
                boxSize="42px"
                bg="teal.50"
                color="teal.600"
                borderRadius="xl"
              >
                <SearchIcon boxSize={5} />
              </Flex>

              <Box>
                <Text fontSize="xl" fontWeight="bold">
                  Find your people
                </Text>
                <Text fontSize="sm" color="gray.500" fontWeight="normal">
                  Search by name or email
                </Text>
              </Box>
            </Flex>
          </DrawerHeader>

          <DrawerBody py={5}>
            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>

              <Input
                placeholder="Type a name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                borderRadius="xl"
                focusBorderColor="teal.500"
                bg="gray.50"
                pr="2.5rem"
                autoComplete="off"
              />

              {search && (
                <InputRightElement>
                  <IconButton
                    aria-label="Clear search"
                    icon={<CloseIcon boxSize={3} />}
                    size="sm"
                    variant="ghost"
                    onClick={() => setSearch("")}
                  />
                </InputRightElement>
              )}
            </InputGroup>

            <Text
              mt={5}
              mb={3}
              fontSize="xs"
              fontWeight="bold"
              color="gray.500"
              textTransform="uppercase"
              letterSpacing="wide"
            >
              {search.trim() ? "Search results" : "Discover people"}
            </Text>

            {loading || loadingChat ? (
              <Box py={3}>
                {loadingChat ? (
                  <Flex justify="center" align="center" gap={3} py={6}>
                    <Spinner color="teal.500" />
                    <Text color="gray.600">Opening conversation...</Text>
                  </Flex>
                ) : (
                  <ChatLoading />
                )}
              </Box>
            ) : searchError ? (
              <Box py={8} textAlign="center">
                <Text color="red.500" fontWeight="medium">
                  {searchError}
                </Text>
                <Button
                  mt={3}
                  size="sm"
                  colorScheme="teal"
                  variant="outline"
                  onClick={() => {
                    const current = search;
                    setSearch("");
                    setTimeout(() => setSearch(current), 0);
                  }}
                >
                  Try again
                </Button>
              </Box>
            ) : searchResult.length > 0 ? (
              <Box>
                {searchResult.map((resultUser) => (
                  <UserListItem
                    key={resultUser._id}
                    user={resultUser}
                    handleFunction={() => accessChat(resultUser._id)}
                  />
                ))}
              </Box>
            ) : searched && search.trim() ? (
              <Flex
                direction="column"
                align="center"
                textAlign="center"
                py={12}
                px={5}
              >
                <Flex
                  boxSize="64px"
                  align="center"
                  justify="center"
                  bg="gray.100"
                  color="gray.500"
                  borderRadius="2xl"
                  mb={4}
                >
                  <SearchIcon boxSize={6} />
                </Flex>

                <Text fontWeight="semibold" color="gray.700">
                  No users found
                </Text>
                <Text mt={1} fontSize="sm" color="gray.500">
                  Try another name or check the spelling.
                </Text>
              </Flex>
            ) : !search.trim() ? (
              <Flex
                direction="column"
                align="center"
                textAlign="center"
                py={10}
                px={5}
              >
                <Text color="gray.500" fontSize="sm">
                  Start typing to find people and begin a conversation.
                </Text>
              </Flex>
            ) : null}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default SideDrawer;
