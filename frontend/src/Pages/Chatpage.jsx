import { Box, Flex, Text } from "@chakra-ui/react";
import { useState } from "react";

import Chatbox from "../components/Chatbox";
import MyChats from "../components/MyChats";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../context/ChatProvider";

const Chatpage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user, selectedChat } = ChatState();

  return (
    <Flex
      direction="column"
      width="100%"
      height="100dvh"
      minH="0"
      overflow="hidden"
      bg="#F1F5F9"
    >
      {user && <SideDrawer />}

      {user ? (
        <Flex
          flex="1"
          minH="0"
          minW="0"
          gap={{ base: 0, md: 4 }}
          p={{ base: 0, md: 4 }}
          align="stretch"
          overflow="hidden"
        >
          <Box
            display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
            flex={{ base: "1 1 100%", md: "0 0 320px", lg: "0 0 360px" }}
            minW={{ base: 0, md: "280px" }}
            minH="0"
            overflow="hidden"
            bg="white"
            borderRadius={{ base: "none", md: "2xl" }}
            borderWidth={{ base: 0, md: "1px" }}
            borderColor="gray.200"
            boxShadow={{
              base: "none",
              md: "0 8px 30px rgba(15, 23, 42, 0.05)",
            }}
          >
            <MyChats fetchAgain={fetchAgain} />
          </Box>

          <Box
            display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
            flex="1"
            minW="0"
            minH="0"
            overflow="hidden"
            bg="white"
            borderRadius={{ base: "none", md: "2xl" }}
            borderWidth={{ base: 0, md: "1px" }}
            borderColor="gray.200"
            boxShadow={{
              base: "none",
              md: "0 8px 30px rgba(15, 23, 42, 0.05)",
            }}
          >
            <Chatbox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
          </Box>
        </Flex>
      ) : (
        <Flex flex="1" align="center" justify="center" px={6}>
          <Box
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="2xl"
            p={8}
            textAlign="center"
            boxShadow="sm"
          >
            <Text fontSize="lg" fontWeight="700" color="gray.800">
              Welcome to Talk-A-Tive
            </Text>
            <Text mt={2} color="gray.500">
              Please log in to access your chats.
            </Text>
          </Box>
        </Flex>
      )}
    </Flex>
  );
};

export default Chatpage;
