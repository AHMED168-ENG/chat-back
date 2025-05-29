const express = require("express");
const cors = require("cors");
const http = require("http");
const setupSocket = require("./config/socket");
const sequelize = require("./config/sequelizeDb");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const questionsRoutes = require("./routes/questions");
const chatgptRoutes = require("./routes/chatgpt");

require("dotenv").config();

const app = express();
const server = http.createServer(app);

// CORS configuration للـ Express
app.use(
  cors({
    origin: "*", // أو حدد الـ origins المحددة
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Api-Key",
      "lang",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
  })
);

// إضافة headers إضافية
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Request-Headers", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Api-Key, lang, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }

  next();
});

app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/v1/auth", authRoutes);
app.use("/v1/chat", chatRoutes);
app.use("/v1/questions", questionsRoutes);
app.use("/v1/chatgpt", chatgptRoutes);
// Socket.IO

let socketServer;
const port = process.env.SOCKET_PORT || 3020;
socketServer = http.createServer(app);

const socketIo = setupSocket(socketServer);
app.set("io", socketIo);
global.socketIO = socketIo;

process.on("uncaughtException", (error) => {
  console.error("❌ خطأ غير متوقع:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("❌ خطأ في Promise:", error);
});

socketServer.listen(port, () => {
  console.log("🚀 server sockit start " + port);
});

// Sync database and start server
const PORT = process.env.PORT || 3000;
sequelize
  .sync({ force: false })
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("Database sync error:", err));

module.exports = app;
