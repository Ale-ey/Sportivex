import process from "node:process";
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import routes
import authRoutes from "./routes/auth.js";
// Global JWT validator
import jwtValidator from "./middlewares/jwt_validator.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Global JWT validation (skips public routes defined inside the middleware)
app.use(jwtValidator);

// API routes
app.use('/api/auth', authRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((error, _req, res, _next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// // Initialize dummy data on server startup
// const initializeDummyData = async () => {
//   try {
//     console.log('\n🔍 Checking for existing dummy data...');
    
//     const checkResult = await checkDummyDataExists();
    
//     if (checkResult.success && checkResult.exists) {
//       console.log(`📊 Found ${checkResult.count} existing dummy users. Skipping insertion.`);
//       console.log('   Existing users:', checkResult.existingUsers.map(u => `${u.name} (${u.cms_id})`).join(', '));
//     } else {
//       console.log('📝 No dummy data found. Inserting dummy users...');
//       const insertResult = await insertDummyData();
      
//       if (insertResult.success) {
//         console.log('✅ Dummy data initialization completed successfully!');
//       } else {
//         console.log('❌ Dummy data initialization failed:', insertResult.message);
//       }
//     }
//   } catch (error) {
//     console.error('❌ Error during dummy data initialization:', error);
//   }
// };

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  
  console.log('\n🎉 Server startup completed!');
});

export default app;
