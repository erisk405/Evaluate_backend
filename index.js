const express = require("express");
require("dotenv").config();
const cors = require("cors");
const routes = require("./routes");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const http = require("http");

// Allow specific frontend origins
const allowedOrigins = [
  "https://evaluation-360.vercel.app",
  "https://evaluation-360-9agw02exx-eris-projects-692a8a83.vercel.app",
];

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      console.log("Origin:", origin); // ดูว่า Origin ที่ส่งมาเป็นอะไร
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"], // Allowed headers
    credentials: true,
  },
});

// JSON
app.use(express.json());
app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // เพิ่ม headers ที่ต้องการ
  })
);
app.options(
  "*",
  cors({
    credentials: true,
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // เพิ่ม OPTIONS
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/api", routes);

// Socket.IO setup
io.on("connection", (socket) => {
  console.log("A user connected");

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
