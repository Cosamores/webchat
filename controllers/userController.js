const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.searchUsers = async (req, res) => {
  const { username } = req.query;

  try {
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: username,
          mode: 'insensitive',
        },
      },
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao buscar usuários.' });
  }
};