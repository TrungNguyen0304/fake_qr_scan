const express = require("express");
const http = require("http");
const path = require("path");
const connectDB = require("./config/db");
require("dotenv").config();
const cors = require("cors");

const clientRoute = require("./route/clientRoute");
const qrcodeRoute = require("./route/qrcodeRoute");
const adminRoute = require("./route/adminRoute");

const { init } = require("./socket/socketInstance");

const app = express();
const server = http.createServer(app);
const io = init(server);
require("./socket/socket")(io);

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://192.168.1.24:5173",
      "https://apitaskmanager.pdteam.net",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Routes
app.use("/api/clients", clientRoute);
app.use("/api/admin", adminRoute);
app.use("/api/qrcode", qrcodeRoute);

const staticPath = path.join(__dirname);
app.use(express.static(staticPath));

// Start server
const PORT = process.env.PORT || 8001;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
