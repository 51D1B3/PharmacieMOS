import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const AdminPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [medications, setMedications] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connexion Socket.IO
    const newSocket = io('http://localhost:5002');
    setSocket(newSocket);

    // Rejoindre la room admin
    newSocket.emit('join-room', { userId: 'admin', role: 'admin' });

    // Écouter les nouvelles ordonnances
    newSocket.on('new-prescription', (data) => {
      setNotifications(prev => [...prev, data]);
      // Recharger la liste
      fetchPrescriptions();
    });

    // Charger les ordonnances existantes
    fetchPrescriptions();

    return () => newSocket.close();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5002/api/prescriptions/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setPrescriptions(data.data.prescriptions);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleProcessPrescription = async () => {
    if (!selectedPrescription || !medications) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5002/api/prescriptions/${selectedPrescription._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'processed',
          pharmacistNotes: medications,
          medications: medications.split('\n').map(med => ({ name: med.trim() }))
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Ordonnance traitée avec succès!');
        setSelectedPrescription(null);
        setMedications('');
        fetchPrescriptions();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Gestion des Ordonnances</h1>
      
      {/* Notifications en temps réel */}
      {notifications.length > 0 && (
        <div className="mb-6 p-4 bg-blue-100 border-l-4 border-blue-500">
          <h3 className="font-semibold">Nouvelles notifications:</h3>
          {notifications.map((notif, index) => (
            <div key={index} className="mt-2 text-sm">
              🔔 {notif.message} - {new Date(notif.submittedAt).toLocaleString()}
            </div>
          ))}
          <button 
            onClick={() => setNotifications([])}
            className="mt-2 text-xs text-blue-600 hover:underline"
          >
            Effacer les notifications
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Liste des ordonnances */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Ordonnances reçues</h2>
          <div className="space-y-4">
            {prescriptions.map((prescription) => (
              <div 
                key={prescription._id}
                className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                  selectedPrescription?._id === prescription._id ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedPrescription(prescription)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{prescription.clientName}</h3>
                    <p className="text-sm text-gray-600">{prescription.clientEmail}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(prescription.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    prescription.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    prescription.status === 'processed' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {prescription.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Détails de l'ordonnance sélectionnée */}
        {selectedPrescription && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Détails de l'ordonnance</h2>
            <div className="bg-white border rounded-lg p-4">
              <div className="mb-4">
                <img 
                  src={selectedPrescription.imageUrl} 
                  alt="Ordonnance"
                  className="w-full max-w-md mx-auto rounded-lg shadow-md"
                />
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium">Client: {selectedPrescription.clientName}</h3>
                <p className="text-sm text-gray-600">Email: {selectedPrescription.clientEmail}</p>
              </div>

              {selectedPrescription.status === 'pending' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Médicaments à prescrire:
                  </label>
                  <textarea
                    value={medications}
                    onChange={(e) => setMedications(e.target.value)}
                    placeholder="Listez les médicaments (un par ligne)..."
                    className="w-full p-3 border border-gray-300 rounded-md h-32"
                  />
                  <button
                    onClick={handleProcessPrescription}
                    className="mt-3 w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
                  >
                    Valider et envoyer au client
                  </button>
                </div>
              )}

              {selectedPrescription.status === 'processed' && (
                <div className="mt-4 p-3 bg-green-50 rounded-md">
                  <h4 className="font-medium text-green-800">Médicaments prescrits:</h4>
                  <p className="text-sm text-green-700 mt-1">
                    {selectedPrescription.pharmacistNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPrescriptions;