import { AddIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { FiMessageCircle } from "react-icons/fi";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";

import { ChatState } from "../Context/ChatProvider";
import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";

const MyChats = ({ fetchAgain }) => {
  const [loading, setLoading] = useState(false);

  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  const toast = useToast();

  const fetchChats = useCallback(async () => {
    if (!user?.token) return;

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      toast({
        title: "Unable to load conversations",
        description: "Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [user, setChats, toast]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats, fetchAgain]);

  const getChatName = (chat) =>
    chat.isGroupChat
      ? chat.chatName || "Unnamed group"
      : getSender(user, chat.users);

  const getPreview = (chat) => {
    if (!chat.latestMessage) return "Start a conversation";

    const sender = chat.latestMessage.sender;
    const isOwnMessage = sender?._id === user?._id;
    const prefix = isOwnMessage ? "You: " : "";

    const content = chat.latestMessage.content || "";

    return `${prefix}${content}`;
  };

  return (
    <Box
      display={{
        base: selectedChat ? "none" : "flex",
        md: "flex",
      }}
      flexDirection="column"
      w={{ base: "100%", md: "340px", lg: "360px" }}
      minW={{ base: "0", md: "280px" }}
      h="100%"
      minH="0"
      bg="white"
      borderRadius={{ base: "none", md: "xl" }}
      borderWidth={{ base: 0, md: 1 }}
      borderColor="gray.200"
      boxShadow={{ base: "none", md: "sm" }}
      overflow="hidden"
    >
      <Flex
        align="center"
        justify="space-between"
        px={5}
        py={5}
        borderBottomWidth="1px"
        borderColor="gray.100"
      >
        <Box>
          <Heading size="md" color="gray.800">
            Messages
          </Heading>
          <Text mt={1} fontSize="sm" color="gray.500">
            Your conversations
          </Text>
        </Box>

        <GroupChatModal>
          <Button
            colorScheme="teal"
            size="sm"
            leftIcon={<AddIcon />}
            borderRadius="lg"
          >
            New group
          </Button>
        </GroupChatModal>
      </Flex>

      <Box flex="1" minH="0" overflowY="auto" p={3}>
        {loading && (!Array.isArray(chats) || chats.length === 0) ? (
          <ChatLoading />
        ) : Array.isArray(chats) && chats.length > 0 ? (
          <Stack spacing={2}>
            {chats.map((chat) => {
              const active = selectedChat?._id === chat._id;
              const name = getChatName(chat);
              const preview = getPreview(chat);

              return (
                <Flex
                  key={chat._id}
                  align="center"
                  gap={3}
                  p={3}
                  borderRadius="xl"
                  cursor="pointer"
                  bg={active ? "teal.50" : "white"}
                  borderWidth="1px"
                  borderColor={active ? "teal.200" : "transparent"}
                  transition="all 0.18s ease"
                  _hover={{
                    bg: active ? "teal.50" : "gray.50",
                    borderColor: "gray.200",
                  }}
                  onClick={() => setSelectedChat(chat)}
                >
                  <Avatar
                    size="md"
                    name={name}
                    bg={active ? "teal.500" : "gray.200"}
                    color={active ? "white" : "gray.700"}
                  />

                  <Box flex="1" minW="0">
                    <Text fontWeight="semibold" color="gray.800" noOfLines={1}>
                      {name}
                    </Text>

                    <Text mt={1} fontSize="sm" color="gray.500" noOfLines={1}>
                      {preview}
                    </Text>
                  </Box>

                  {active && (
                    <Box
                      w="8px"
                      h="8px"
                      borderRadius="full"
                      bg="teal.500"
                      flexShrink={0}
                    />
                  )}
                </Flex>
              );
            })}
          </Stack>
        ) : (
          <Flex
            direction="column"
            align="center"
            justify="center"
            textAlign="center"
            h="100%"
            px={5}
            py={10}
          >
            <Flex
              w="64px"
              h="64px"
              align="center"
              justify="center"
              bg="teal.50"
              borderRadius="2xl"
              mb={4}
            >
              <Icon as={FiMessageCircle} boxSize={7} color="teal.500" />
            </Flex>

            <Heading size="sm" color="gray.700">
              No conversations yet
            </Heading>

            <Text mt={2} fontSize="sm" color="gray.500">
              Search for someone and start chatting.
            </Text>
          </Flex>
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
