// server.js (Express + WebSocket)
const express = require('express');
const helmet = require('helmet');   // Security headers
const cors = require('cors');       // Cross-origin resource sharing
const Joi = require('joi');         // Data validation
const http = require('http');       // Node http server
const { Server } = require("socket.io"); // Socket.io
require('dotenv').config();         // Load .env file

const app = express();
const PORT = process.env.PORT || 3001;
const APP_NAME = process.env.APP_NAME || 'My App';

// -------------------- MIDDLEWARE --------------------
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // อนุญาต inline script
      },
    },
  })
);
app.use(cors());
app.use(express.json()); // สำหรับอ่าน JSON body จาก request

// -------------------- ROUTES --------------------

// Root route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html'); // ใช้ HTML client ของ Socket.io
});

// API Example
app.get('/api/data', (req, res) => {
  res.json({ message: 'This data is open for everyone!' });
});

// Joi Schema สำหรับตรวจสอบ user
const userSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string()
    .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
    .required(),
  birth_year: Joi.number().integer().min(1900).max(new Date().getFullYear())
});

// Route POST /api/users
app.post('/api/users', (req, res) => {
  const { error, value } = userSchema.validate(req.body);

  if (error) {
    return res
      .status(400)
      .json({ message: 'Invalid data', details: error.details });
  }

  console.log('✅ Validated data:', value);
  res
    .status(201)
    .json({ message: 'User created successfully!', data: value });
});

// -------------------- SERVER + SOCKET.IO --------------------
const server = http.createServer(app); // สร้าง HTTP server
const io = new Server(server, {
  cors: { origin: "*" } // อนุญาตทุกที่
});

// Event ของ Socket.io
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
    io.emit('chat message', `[${socket.id} says]: ${msg}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// -------------------- START SERVER --------------------
server.listen(PORT, () => {
  console.log(`🚀 ${APP_NAME} with WebSocket running on http://localhost:${PORT}`);
});
