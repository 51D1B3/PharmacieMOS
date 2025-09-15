import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Établir la connexion au serveur Socket.IO
      const newSocket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002', {
        transports: ['websocket', 'polling'],
      });

      setSocket(newSocket);

      // Rejoindre une room basée sur le rôle de l'utilisateur
      newSocket.on('connect', () => {
        console.log('Socket.IO Connected:', newSocket.id);
        if (user.role) {
          newSocket.emit('join-room', { userId: user._id, role: user.role });
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Socket.IO Disconnected');
      });

      // Nettoyage à la déconnexion de l'utilisateur ou au démontage du composant
      return () => {
        newSocket.disconnect();
      };
    } else if (socket) {
      // Si l'utilisateur se déconnecte, on coupe la connexion
      socket.disconnect();
      setSocket(null);
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
