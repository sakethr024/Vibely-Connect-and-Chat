import { Avatar, Tooltip } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../context/ChatProvider";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();
  const scrollRef = useRef(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      className="messages-scroll-container"
      style={{
        height: "100%",
        width: "100%",
        minHeight: 0,
        overflowY: "auto",
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          padding: "8px 2px",
        }}
      >
        {messages?.map((message, index) => {
          const isOwnMessage = message.sender?._id === user?._id;

          const showAvatar =
            isSameSender(messages, message, index, user._id) ||
            isLastMessage(messages, index, user._id);

          return (
            <div
              key={message._id}
              className="chat-message"
              style={{
                justifyContent: isOwnMessage ? "flex-end" : "flex-start",
                marginTop: isSameUser(messages, message, index, user._id)
                  ? 0
                  : 6,
              }}
            >
              {!isOwnMessage && showAvatar ? (
                <Tooltip
                  label={message.sender?.name || "User"}
                  placement="bottom-start"
                  hasArrow
                >
                  <Avatar
                    size="xs"
                    name={message.sender?.name}
                    src={message.sender?.pic}
                    flexShrink={0}
                  />
                </Tooltip>
              ) : !isOwnMessage ? (
                <div style={{ width: 24, flexShrink: 0 }} />
              ) : null}

              <div
                className={`chat-bubble ${
                  isOwnMessage ? "chat-bubble--sent" : "chat-bubble--received"
                }`}
                style={{
                  marginLeft: !isOwnMessage
                    ? isSameSenderMargin(messages, message, index, user._id)
                    : 0,
                }}
                title={message.sender?.name || ""}
              >
                {message.content}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScrollableChat;
