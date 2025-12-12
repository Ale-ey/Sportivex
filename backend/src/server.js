import dotenv from "dotenv";
dotenv.config();
import process from "node:process";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { createServer } from "http";

import authRoutes from "./routes/auth.js";
import swimmingRoutes from "./routes/swimming.js";
import badmintonRoutes from "./routes/badminton.js";
import gymRoutes from "./routes/gym.js";
import leagueRoutes from "./routes/leagues.js";
import horseRidingRoutes from "./routes/horseRiding.js";
import qrRoutes from "./routes/qr.js";
import { initializeSocketServer } from "./socket/socketServer.js";

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// Initialize Socket.IO
export const io = initializeSocketServer(httpServer);

// -------------------
// CORS MUST BE FIRST
// -------------------
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    const allowedOrigins = [
      process.env.FRONTEND_URL || "http://localhost:5174",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      "https://sportivex.vercel.app",
      "https://sportivex-git-dev-ale-eys-projects.vercel.app"
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Authorization"],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// -------------------
// BASIC MIDDLEWARE
// -------------------
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------
// HEALTH CHECK
// -------------------
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/swimming', swimmingRoutes);
app.use('/api/badminton', badmintonRoutes);
app.use('/api/gym', gymRoutes);
app.use('/api/leagues', leagueRoutes);
app.use('/api/horse-riding', horseRidingRoutes);
app.use('/api/qr', qrRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// -------------------
// GLOBAL ERROR HANDLER (MUST BE LAST)
// -------------------
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // Set CORS headers even on errors
  const origin = req.headers.origin;
  const allowedOrigins = [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://sportivex.vercel.app",
    "https://sportivex-git-dev-ale-eys-projects.vercel.app"
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

// -------------------
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`Swimming endpoints: http://localhost:${PORT}/api/swimming`);
  console.log(`Badminton endpoints: http://localhost:${PORT}/api/badminton`);
  console.log(`Gym endpoints: http://localhost:${PORT}/api/gym`);
  console.log(`Horse Riding endpoints: http://localhost:${PORT}/api/horse-riding`);
  console.log(`WebSocket server: ws://localhost:${PORT}`);
  
  console.log('\n🎉 Server startup completed!');
});

export default app;
