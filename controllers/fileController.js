const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.uploadFile = async (req, res) => {
  const { roomId } = req.body;
  const { file } = req;

  if (!file || !roomId) {
    return res.status(400).json({ error: 'Arquivo e roomId são necessários' });
  }

  try {
    // Create a message with the file URL
    const message = await prisma.message.create({
      data: {
        fileUrl: `/uploads/${file.filename}`,
        fileType: file.mimetype,
        room: { connect: { id: roomId } },
        sender: { connect: { id: req.userId } },
      },
      include: {
        sender: { select: { username: true } },
      },
    });

    res.status(201).json({ message: 'Arquivo armazenado com sucesso.', data: message });
  } catch (error) {
    console.error('Erro ao armazenar arquivo:', error);
    res.status(500).json({ error: 'Erro ao armazenar arquivo' });
  }
};