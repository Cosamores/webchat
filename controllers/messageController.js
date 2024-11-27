const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.getRoomMessages = async (req, res) => {
  const { roomId } = req.params;

  try {
    const messages = await prisma.message.findMany({
      where: { roomId },
      include: {
        sender: {
          select: { username: true },
        },
      },
      orderBy: { created_at: 'asc' },
    });
    res.status(200).json(messages);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao buscar mensagens.' });
  }
};