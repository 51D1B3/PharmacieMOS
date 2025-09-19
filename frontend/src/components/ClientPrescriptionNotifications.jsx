import React, { useState, useEffect } from 'react';
import { Check, Clock, FileText } from 'lucide-react';
import { io } from 'socket.io-client';

const ClientPrescriptionNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connexion Socket.IO
    const newSocket = io('http://localhost:5005');
    setSocket(newSocket);

    // Rejoindre la room client
    newSocket.emit('join-room', { userId: 'client', role: 'client' });

    // Écouter les validations de prescriptions
    newSocket.on('prescription-validated', (prescription) => {
      console.log('🔔 Prescription validée reçue:', prescription);
      
      const medicationsList = prescription.medications?.map(med => 
        `${med.name} (x${med.quantity})`
      ).join(', ') || 'Aucun médicament';
      
      const notification = {
        id: Date.now(),
        type: 'prescription-validated',
        title: 'Ordonnance validée',
        message: `Votre ordonnance a été validée par le pharmacien`,
        description: `Médicaments prescrits: ${medicationsList}. Total: ${prescription.totalAmount?.toLocaleString()} GNF`,
        timestamp: new Date(),
        read: false,
        prescription: prescription
      };
      
      setNotifications(prev => [notification, ...prev]);
      
      // Notification navigateur
      if (Notification.permission === 'granted') {
        new Notification('Ordonnance validée', {
          body: `Médicaments: ${medicationsList}`,
          icon: '/favicon.ico'
        });
      }
    });

    // Demander permission notifications
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => newSocket.close();
  }, []);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-blue-600" />
          Mes Ordonnances
        </h3>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucune notification pour le moment</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                notification.read 
                  ? 'bg-gray-50 border-gray-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  {notification.description && (
                    <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                      <p className="text-sm text-green-800 font-medium">
                        Prescription du pharmacien:
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        {notification.description}
                      </p>
                    </div>
                  )}
                  <div className="mt-3">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open('https://via.placeholder.com/600x400?text=Ordonnance', '_blank');
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium"
                    >
                      👁️ Voir l'ordonnance
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {notification.timestamp.toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientPrescriptionNotifications;