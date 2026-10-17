import { Avatar, Box, Text } from "@chakra-ui/react";

const UserListItem = ({ user, handleFunction }) => {
  return (
    <Box
      onClick={handleFunction}
      cursor="pointer"
      bg="white"
      _hover={{
        bg: "teal.50",
        borderColor: "teal.300",
      }}
      w="100%"
      display="flex"
      alignItems="center"
      color="gray.800"
      px={3}
      py={3}
      mb={2}
      borderRadius="lg"
      border="1px solid"
      borderColor="gray.100"
      transition="all 0.2s ease"
    >
      <Avatar
        mr={3}
        size="md"
        name={user?.name || "User"}
        src={user?.pic}
        bg="teal.500"
        color="white"
        flexShrink={0}
      />

      <Box minW={0} flex="1">
        <Text fontWeight="semibold" noOfLines={1}>
          {user?.name || "Unknown user"}
        </Text>

        <Text fontSize="sm" color="gray.500" noOfLines={1}>
          <Text as="span" fontWeight="medium">
            Email:
          </Text>{" "}
          {user?.email || "No email available"}
        </Text>
      </Box>
    </Box>
  );
};

export default UserListItem;
