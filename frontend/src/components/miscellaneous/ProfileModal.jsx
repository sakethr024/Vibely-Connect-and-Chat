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
  IconButton,
  Text,
  Image,
  Flex,
} from "@chakra-ui/react";

const ProfileModal = ({ user, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      {children ? (
        <span onClick={onOpen} style={{ width: "100%" }}>
          {children}
        </span>
      ) : (
        <IconButton
          display={{ base: "flex" }}
          icon={<ViewIcon />}
          aria-label="View Profile"
          onClick={onOpen}
        />
      )}

      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay />

        <ModalContent>
          <ModalHeader
            textAlign="center"
            fontSize="40px"
            fontFamily="Work sans"
          >
            {user?.name}
          </ModalHeader>

          <ModalCloseButton />

          <ModalBody>
            <Flex direction="column" align="center" justify="center" gap={5}>
              <Image
                borderRadius="full"
                boxSize="150px"
                src={user?.pic}
                alt={user?.name}
              />

              <Text
                fontSize={{ base: "24px", md: "28px" }}
                fontFamily="Work sans"
              >
                Email: {user?.email}
              </Text>
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;
