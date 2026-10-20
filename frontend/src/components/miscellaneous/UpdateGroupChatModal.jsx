import { ViewIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  FormControl,
  Input,
  useToast,
  Box,
  IconButton,
  Spinner,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { ChatState } from "../../context/ChatProvider";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import UserListItem from "../userAvatar/UserListItem";

const UpdateGroupChatModal = ({ fetchMessages, fetchAgain, setFetchAgain }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [groupChatName, setGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);

  const toast = useToast();
  const { selectedChat, setSelectedChat, user } = ChatState();

  const showError = (error, fallbackMessage) => {
    toast({
      title: "Error occurred",
      description:
        error?.response?.data?.message || error?.message || fallbackMessage,
      status: "error",
      duration: 5000,
      isClosable: true,
      position: "bottom",
    });
  };

  const getConfig = () => ({
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  });

  const handleSearch = async (query) => {
    setSearch(query);

    if (!query.trim()) {
      setSearchResult([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.get(
        `/api/user?search=${encodeURIComponent(query.trim())}`,
        getConfig(),
      );

      setSearchResult(Array.isArray(data) ? data : []);
    } catch (error) {
      showError(error, "Failed to load search results");
      setSearchResult([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async () => {
    const chatName = groupChatName.trim();

    if (!chatName) {
      toast({
        title: "Please enter a group name",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!selectedChat?._id || !user?.token) return;

    try {
      setRenameLoading(true);

      const { data } = await axios.put(
        "/api/chat/rename",
        {
          chatId: selectedChat._id,
          chatName,
        },
        getConfig(),
      );

      setSelectedChat(data);
      setFetchAgain((prev) => !prev);
      setGroupChatName("");

      toast({
        title: "Group name updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      showError(error, "Failed to rename group");
    } finally {
      setRenameLoading(false);
    }
  };

  const handleAddUser = async (userToAdd) => {
    if (!selectedChat || !userToAdd || !user) return;

    if (selectedChat.users.some((u) => u._id === userToAdd._id)) {
      toast({
        title: "User already in group",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (selectedChat.groupAdmin?._id !== user._id) {
      toast({
        title: "Only admins can add users",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.put(
        "/api/chat/groupadd",
        {
          chatId: selectedChat._id,
          userId: userToAdd._id,
        },
        getConfig(),
      );

      setSelectedChat(data);
      setFetchAgain((prev) => !prev);
      setSearch("");
      setSearchResult([]);
    } catch (error) {
      showError(error, "Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userToRemove) => {
    if (!selectedChat || !userToRemove || !user) return;

    const isAdmin = selectedChat.groupAdmin?._id === user._id;
    const isLeaving = userToRemove._id === user._id;

    if (!isAdmin && !isLeaving) {
      toast({
        title: "Only admins can remove users",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.put(
        "/api/chat/groupremove",
        {
          chatId: selectedChat._id,
          userId: userToRemove._id,
        },
        getConfig(),
      );

      if (isLeaving) {
        setSelectedChat(null);
        onClose();
      } else {
        setSelectedChat(data);
      }

      setFetchAgain((prev) => !prev);

      if (typeof fetchMessages === "function" && !isLeaving) {
        await fetchMessages();
      }
    } catch (error) {
      showError(error, "Failed to remove user");
    } finally {
      setLoading(false);
    }
  };

  if (!selectedChat) return null;

  return (
    <>
      <IconButton
        aria-label="View group details"
        icon={<ViewIcon />}
        onClick={onOpen}
      />

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />

        <ModalContent>
          <ModalHeader
            fontSize="2xl"
            fontFamily="Work Sans, sans-serif"
            display="flex"
            justifyContent="center"
          >
            {selectedChat.chatName}
          </ModalHeader>

          <ModalCloseButton />

          <ModalBody display="flex" flexDirection="column" alignItems="center">
            <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
              {selectedChat.users?.map((groupUser) => (
                <UserBadgeItem
                  key={groupUser._id}
                  user={groupUser}
                  admin={selectedChat.groupAdmin}
                  handleFunction={() => handleRemove(groupUser)}
                />
              ))}
            </Box>

            <FormControl display="flex" mb={3}>
              <Input
                placeholder="Group name"
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />

              <Button
                colorScheme="teal"
                ml={2}
                isLoading={renameLoading}
                onClick={handleRename}
              >
                Update
              </Button>
            </FormControl>

            <FormControl>
              <Input
                placeholder="Add user to group"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>

            {loading ? (
              <Spinner size="lg" mt={3} />
            ) : (
              searchResult.map((searchUser) => (
                <UserListItem
                  key={searchUser._id}
                  user={searchUser}
                  handleFunction={() => handleAddUser(searchUser)}
                />
              ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="red"
              onClick={() => handleRemove(user)}
              isLoading={loading}
            >
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;
