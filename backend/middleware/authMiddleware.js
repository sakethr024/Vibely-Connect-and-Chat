
const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check whether the Authorization header exists
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("Authentication failed: Missing or invalid Authorization header");

    return res.status(401).json({
      message: "Not authorized, no token",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify JWT and decode its payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // console.log("JWT verified successfully");
    // console.log("Decoded user ID:", decoded.id);

    // Find the user associated with the token
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      console.log("Authentication failed: User not found");

      return res.status(401).json({
        message: "Not authorized, user not found",
      });
    }

    // Attach authenticated user to the request
    req.user = user;

    // console.log("Authentication successful for user:", user._id);

    return next();
  } catch (error) {
    // Log the actual error in the backend terminal
    console.error("JWT authentication error:", error.name, error.message);

    return res.status(401).json({
      message: "Not authorized, token invalid or expired",
    });
  }
});

module.exports = { protect };