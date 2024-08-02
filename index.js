const express = require("express");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();
const cors = require("cors");
const {upload , deleteImage} = require("./controllers/routeUpload");
const routes = require("./routes");
const cookieParser = require("cookie-parser");
const prisma = new PrismaClient();
const app = express();


//json
app.use(express.json());

app.use(cookieParser());
// CORS configuration
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000", // Allow only this origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type"], // Allowed headers
  })
);

app.use("/api", routes);


//start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));