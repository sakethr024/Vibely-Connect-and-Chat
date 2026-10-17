import {
  FormControl,
  Input,
  Box,
  Text,
  IconButton,
  Spinner,
  useToast,
  Flex,
} from "@chakra-ui/react";
import "./styles.css";

import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";

import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";

const ENDPOINT = "http://localhost:5000";

let socket;
let selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const toast = useToast();
  const { selectedChat, setSelectedChat, user, setNotification } = ChatState();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData,
    rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
  };

  const fetchMessages = useCallback(async () => {
    if (!selectedChat?._id || !user?.token) return;

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config,
      );
      setMessages(data);
      socket?.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error occurred",
        description:
          error?.response?.data?.message || "Failed to load messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedChat?._id, user?.token, toast]);

  useEffect(() => {
    if (!user?._id) return;

    const newSocket = io(ENDPOINT);
    socket = newSocket;
    newSocket.emit("setup", user);
    newSocket.on("connected", () => setSocketConnected(true));
    newSocket.on("typing", () => setIsTyping(true));
    newSocket.on("stop typing", () => setIsTyping(false));

    return () => {
      newSocket.off("connected");
      newSocket.off("typing");
      newSocket.off("stop typing");
      newSocket.disconnect();
      if (socket === newSocket) socket = undefined;
      setSocketConnected(false);
    };
  }, [user]);

  useEffect(() => {
    if (!selectedChat?._id) {
      setMessages([]);
      selectedChatCompare = undefined;
      return;
    }
    selectedChatCompare = selectedChat;
    fetchMessages();
  }, [selectedChat, fetchMessages]);

  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat?._id
      ) {
        setNotification((prev) => {
          const exists = prev.some(
            (item) => item._id === newMessageReceived._id,
          );
          return exists ? prev : [newMessageReceived, ...prev];
        });
        setFetchAgain((prev) => !prev);
      } else {
        setMessages((prev) => [...prev, newMessageReceived]);
      }
    };

    socket.on("message recieved", handleMessageReceived);
    return () => socket?.off("message recieved", handleMessageReceived);
  }, [setFetchAgain, setNotification]);

  const sendMessage = async (event) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();

    const content = newMessage.trim();
    if (!content || !selectedChat?._id || !user?.token || !socket) return;

    socket.emit("stop typing", selectedChat._id);
    setTyping(false);

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      setNewMessage("");
      const { data } = await axios.post(
        "/api/message",
        { content, chatId: selectedChat._id },
        config,
      );
      socket.emit("new message", data);
      setMessages((prev) => [...prev, data]);
    } catch (error) {
      setNewMessage(content);
      toast({
        title: "Error occurred",
        description:
          error?.response?.data?.message || "Failed to send the message",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const typingHandler = (event) => {
    setNewMessage(event.target.value);
    if (!socketConnected || !selectedChat?._id || !socket) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
  };

  useEffect(() => {
    if (!typing || !selectedChat?._id || !socket) return;
    const timeout = setTimeout(() => {
      socket?.emit("stop typing", selectedChat._id);
      setTyping(false);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [newMessage, typing, selectedChat?._id]);

  const chatTitle = selectedChat
    ? selectedChat.isGroupChat
      ? selectedChat.chatName || "Group chat"
      : getSender(user, selectedChat.users)
    : "";

  return (
    <Flex
      direction="column"
      flex="1"
      minW="0"
      minH="0"
      h="100%"
      overflow="hidden"
    >
      {selectedChat ? (
        <>
          <Flex
            align="center"
            gap={3}
            px={{ base: 4, md: 5 }}
            py={3}
            minH="76px"
            borderBottom="1px solid"
            borderColor="gray.100"
            flexShrink={0}
          >
            <IconButton
              aria-label="Back to chats"
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              variant="ghost"
              onClick={() => setSelectedChat(null)}
            />

            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              w="42px"
              h="42px"
              borderRadius="full"
              bg="teal.50"
              color="teal.700"
              fontWeight="bold"
              flexShrink={0}
            >
              {chatTitle.charAt(0).toUpperCase()}
            </Box>

            <Box flex="1" minW="0">
              <Text
                fontSize="md"
                fontWeight="700"
                color="gray.800"
                noOfLines={1}
              >
                {chatTitle}
              </Text>
              <Text fontSize="xs" color="teal.600" mt={1}>
                {isTyping
                  ? "Typing..."
                  : selectedChat.isGroupChat
                    ? `${selectedChat.users?.length || 0} members`
                    : "Conversation"}
              </Text>
            </Box>

            {!selectedChat.isGroupChat ? (
              <ProfileModal user={getSenderFull(user, selectedChat.users)} />
            ) : (
              <UpdateGroupChatModal
                fetchMessages={fetchMessages}
                fetchAgain={fetchAgain}
                setFetchAgain={setFetchAgain}
              />
            )}
          </Flex>

          <Flex
            direction="column"
            flex="1"
            minH="0"
            minW="0"
            overflow="hidden"
            bg="#F8FAFC"
          >
            <Box
              flex="1"
              minH="0"
              overflow="hidden"
              px={{ base: 3, md: 5 }}
              py={3}
            >
              {loading ? (
                <Flex align="center" justify="center" h="100%">
                  <Spinner size="xl" color="teal.500" thickness="3px" />
                </Flex>
              ) : (
                <div className="messages">
                  <ScrollableChat messages={messages} />
                </div>
              )}
            </Box>

            <Box
              px={{ base: 3, md: 5 }}
              pt={2}
              pb={{ base: 3, md: 4 }}
              bg="white"
              borderTop="1px solid"
              borderColor="gray.100"
              flexShrink={0}
            >
              {isTyping && (
                <Text fontSize="xs" color="teal.600" mb={2} ml={2}>
                  {selectedChat.isGroupChat
                    ? "Someone is typing..."
                    : `${chatTitle} is typing...`}
                </Text>
              )}
              <FormControl
                onKeyDown={sendMessage}
                isRequired
                className="chat-composer"
              >
                <Input
                  variant="filled"
                  bg="gray.50"
                  border="1px solid"
                  borderColor="gray.200"
                  placeholder="Write a message and press Enter..."
                  value={newMessage}
                  onChange={typingHandler}
                  aria-label="Write a message"
                />
              </FormControl>
              <Text mt={2} ml={2} fontSize="xs" color="gray.400">
                Press Enter to send
              </Text>
            </Box>
          </Flex>
        </>
      ) : (
        <Flex
          flex="1"
          direction="column"
          align="center"
          justify="center"
          textAlign="center"
          px={6}
          bg="linear-gradient(145deg, #f8fafc 0%, #ecfdf5 100%)"
        >
          <Flex
            align="center"
            justify="center"
            w="76px"
            h="76px"
            borderRadius="2xl"
            bg="white"
            color="teal.600"
            boxShadow="0 12px 35px rgba(15, 118, 110, 0.12)"
            mb={5}
          >
            <Text fontSize="3xl" fontWeight="800">
              T
            </Text>
          </Flex>
          <Text
            fontSize={{ base: "xl", md: "2xl" }}
            fontWeight="800"
            color="gray.800"
          >
            Your conversations, all in one place
          </Text>
          <Text mt={2} maxW="360px" color="gray.500" fontSize="sm">
            Choose a conversation from the sidebar or search for someone to
            start chatting.
          </Text>
        </Flex>
      )}
    </Flex>
  );
};

export default SingleChat;
