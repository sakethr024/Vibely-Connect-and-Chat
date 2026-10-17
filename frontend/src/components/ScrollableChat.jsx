import { Avatar, Tooltip } from "@chakra-ui/react";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  return (
    <ScrollableFeed>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
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
                className={`chat-bubble ${isOwnMessage ? "chat-bubble--sent" : "chat-bubble--received"}`}
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
    </ScrollableFeed>
  );
};

export default ScrollableChat;
