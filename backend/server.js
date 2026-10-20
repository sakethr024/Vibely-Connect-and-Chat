const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");

dotenv.config();

connectDB();

const app = express();

app.use(express.json());

// API routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// Frontend deployment
const frontendPath = path.join(__dirname, "..", "frontend", "dist");

if (process.env.NODE_ENV === "production") {
  app.use(express.static(frontendPath));

  // Serve the React app for frontend routes
  app.get("/{*splat}", (req, res, next) => {
    res.sendFile(path.join(frontendPath, "index.html"), (err) => {
      if (err) next(err);
    });
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});

// Socket.IO configuration
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.CLIENT_URL || true
        : "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.IO events
io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userData) => {
    if (!userData?._id) return;

    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room:", room);
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
  });

  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing");
  });

  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived.chat;

    if (!chat?.users) {
      console.log("chat.users not defined");
      return;
    }

    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageReceived);
    });
  });

  socket.on("disconnect", () => {
    console.log("USER DISCONNECTED");
  });
});
