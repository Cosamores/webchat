const express = require('express');
const http = require('http');
const setupWebSocket = require('./utils/websocket');
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const messageRoutes = require('./routes/messageRoutes');
const userRoutes = require('./routes/userRoutes');


const app = express();
const cors = require('cors');
app.use(cors({ origin: '*' }));

const server = http.createServer(app);
// Initialize WebSocket
setupWebSocket(server);

const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/rooms', roomRoutes);
app.use('/messages', messageRoutes);
app.use('/users', userRoutes);
app.use('/files', express.static('uploads'));

// Start the server
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta: ${PORT}`);
});