
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useHistory } from "react-router-dom";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState([]);

  const history = useHistory();

  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");

    let userInfo = null;

    try {
      userInfo = storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Invalid userInfo in localStorage:", error);
      localStorage.removeItem("userInfo");
    }

    setUser(userInfo);

    if (!userInfo) {
      history.push("/");
    }
  }, [history]);

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        user,
        setUser,
        notification,
        setNotification,
        chats,
        setChats,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
