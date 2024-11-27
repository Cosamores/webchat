const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.createRoom = async (req, res) => {
  const { name } = req.body;

  try {
    const room = await prisma.room.create({
      data: {
        name,
        creator: {
          connect: { id: req.userId },
        },
      },
    });
    const roomLink = `http://localhost:3000/rooms/${room.id}`;
    res.status(201).json({ message: 'Sala criada', room, roomLink });
  } catch (error) {
    console.error('Erro ao criar sala:', error);
    res.status(400).json({ error: 'Erro ao criar sala' });
  }
};

exports.joinRoom = async (req, res) => {
  const { roomId } = req.body;

  try {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }

    // Add user to room using the UserRoom model
    await prisma.userRoom.create({
      data: {
        userId: req.userId,
        roomId: roomId,
      },
    });

    res.status(200).json({ message: 'Entrou na sala', room });
  } catch (error) {
    console.error('Não foi possível entrar na sala:', error);
    res.status(400).json({ error: 'Não foi possível entrar na sala' });
  }
};

exports.listRooms = async (req, res) => {
  try {
    // Get room IDs where the user is a member
    const userRooms = await prisma.userRoom.findMany({
      where: { userId: req.userId },
      select: { roomId: true },
    });

    const roomIds = userRooms.map((ur) => ur.roomId);

    // Find rooms where the user is the creator or a member
    const rooms = await prisma.room.findMany({
      where: {
        OR: [
          { creatorId: req.userId },
          { id: { in: roomIds } },
        ],
      },
    });

    res.status(200).json(rooms);
  } catch (error) {
    console.log('Erro ao buscar salas:', error);
    res.status(400).json({ error: 'Erro ao buscar salas' });
  }
};

exports.getRoomUsers = async (req, res) => {
  const { roomId } = req.params;

  try {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { users: true },
    });

    if (!room) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }

    res.status(200).json(room.users);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao buscar usuários' });
  }
};