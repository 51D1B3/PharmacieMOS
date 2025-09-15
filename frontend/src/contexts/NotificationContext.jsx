import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';

const NotificationContext = createContext();

export const useNotification = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const socket = useSocket();
  const [prescriptionCount, setPrescriptionCount] = useState(0);
  const [lastPrescription, setLastPrescription] = useState(null);

  useEffect(() => {
    if (socket) {
      // Écouter les nouvelles ordonnances
      socket.on('new-prescription', (prescription) => {
        console.log('Nouvelle ordonnance reçue par notification:', prescription);
        setPrescriptionCount(prevCount => prevCount + 1);
        setLastPrescription(prescription);
        // Optionnel: jouer un son de notification
        // const audio = new Audio('/path/to/notification.mp3');
        // audio.play();
      });

      // Nettoyage de l'écouteur
      return () => {
        socket.off('new-prescription');
      };
    }
  }, [socket]);

  const clearPrescriptionNotifications = () => {
    setPrescriptionCount(0);
  };

  const value = {
    prescriptionCount,
    lastPrescription,
    clearPrescriptionNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
