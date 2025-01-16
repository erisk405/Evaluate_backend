const express = require("express");
require("dotenv").config();
const cors = require("cors");
const routes = require("./routes");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const http = require("http");

// Allow specific frontend origins
const allowedOrigins = [process.env.CLIENT_URL, "http://localhost:3000"];

const app = express();
const server = http.createServer(app);
// JSON
app.use(express.json());
// ตั้งค่า cookie-parser ก่อน routes
app.use(cookieParser());
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"], // อนุญาต headers ที่ต้องการ
    exposedHeaders: ["Set-Cookie"],
    credentials: true,
  })
);
app.use("/api", routes);

io.on("connection", (socket) => {
  console.log("A user connected");
  console.log("New connection:", socket.id);
  // จับ error ที่เกิดขึ้นกับ server
  socket.on("error", (error) => {
    console.log("Socket error:", error);
  });

  socket.on("newRoleRequest", (data) => {
    io.emit("adminNotification", data);
    console.log("Received newRoleRequest:", data);
  });

  socket.on("roleRequestHandled", (data) => {
    io.emit("userNotification", data);
  });

  socket.on("evaluatedHandled", (data) => {
    io.emit("evaluatedNotification", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
