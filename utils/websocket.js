const { WebSocketServer } = require("ws");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY;

const setupWebSocket = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {
    console.log("New WebSocket connection");

    // Parse token from query parameters
    const url = new URL(req.url, `http://${req.headers.host}`);
    const params = url.searchParams;
    const token = params.get("token");
    const roomId = params.get("roomId");

    let currentUserId = null;

    if (!token || !roomId) {
      ws.close();
      return;
    }

    // Authenticate the user
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      currentUserId = decoded.userId;
      ws.userId = currentUserId;
      ws.roomId = roomId;
    } catch (error) {
      console.error("WebSocket authentication error:", error);
      ws.close();
      return;
    }

    // Join the room group
    ws.joinedRooms = new Set();
    ws.joinedRooms.add(roomId);

    // Handle incoming messages
    ws.on("message", async (message) => {
      try {
        // Parse message as JSON to handle different message types
        const parsedMessage = JSON.parse(message);

        if (parsedMessage.type === "text") {
          // Handle text message
          const newMessage = await prisma.message.create({
            data: {
              content: parsedMessage.content,
              room: { connect: { id: ws.roomId } },
              sender: { connect: { id: ws.userId } },
            },
            include: {
              sender: { select: { username: true } },
            },
          });

          // Broadcast to clients in the room
          broadcastMessage(wss, ws.roomId, {
            roomId: ws.roomId,
            content: newMessage.content,
            sender: newMessage.sender.username,
            createdAt: newMessage.created_at,
          });
        } else if (parsedMessage.type === "file") {
          const fileMessage = await prisma.message.findUnique({
            where: { id: parsedMessage.messageId },
            include: { sender: { select: { username: true } } },
          });

          broadcastMessage(wss, ws.roomId, {
            roomId: ws.roomId,
            fileUrl: fileMessage.fileUrl,
            fileType: fileMessage.fileType,
            sender: fileMessage.sender.username,
            createdAt: fileMessage.created_at,
          });
        }
      } catch (error) {
        console.error("Error handling message:", error);
        ws.send(JSON.stringify({ error: "Error processing message" }));
      }
    });

    // Helper function to broadcast messages
    function broadcastMessage(wss, roomId, message) {
      wss.clients.forEach((client) => {
        if (
          client.readyState === ws.OPEN &&
          client.joinedRooms &&
          client.joinedRooms.has(roomId)
        ) {
          client.send(JSON.stringify(message));
        }
      });
    }

    ws.on("close", () => {
      console.log("WebSocket connection closed");
      ws.joinedRooms.delete(roomId);
    });

    ws.on("error", (error) => {
      console.error("WebSocket server error:", error);
    });
  });
};

module.exports = setupWebSocket;
