let io;

export const setIO = (socketIO) => {
  io = socketIO;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

export default function socketHandler(socketIO) {
  io = socketIO;
  
  io.on('connection', (socket) => {
    console.log('🔌 Client connecté:', socket.id);

    // Rejoindre une room selon le rôle
    socket.on('join-room', (data) => {
      const { userId, role } = data;
      socket.join(role); // 'admin', 'client', 'pharmacist'
      socket.userId = userId;
      socket.userRole = role;
      console.log(`👤 User ${userId} rejoint la room ${role}`);
    });

    // Gérer les notifications de support
    socket.on('support-notification', (notification) => {
      console.log('📧 Notification de support reçue:', notification);
      // Envoyer la notification au pharmacien
      socket.to('pharmacist').emit('support-notification', notification);
    });

    socket.on('disconnect', () => {
      console.log('❌ Client déconnecté:', socket.id);
    });
  });

  setIO(io);
  console.log('✅ Socket.IO handler initialisé');
}