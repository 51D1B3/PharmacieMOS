import React, { useState, useEffect } from 'react';
import { Clipboard, Eye, Check, X, User, Calendar } from 'lucide-react';
import { io } from 'socket.io-client';

const AdminPrescriptionManager = ({ onNotificationUpdate }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [description, setDescription] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connexion Socket.IO
    const newSocket = io('http://localhost:5005');
    setSocket(newSocket);

    // Rejoindre la room admin
    newSocket.emit('join-room', { userId: 'admin', role: 'admin' });

    // Écouter les nouvelles prescriptions
    newSocket.on('new-prescription', (data) => {
      console.log('🔔 Nouvelle prescription reçue:', data);
      loadPrescriptions();
      // Notifier le parent pour mettre à jour le badge
      if (onNotificationUpdate) {
        onNotificationUpdate();
      }
    });

    loadPrescriptions();

    return () => newSocket.close();
  }, []);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5005/api/prescriptions/all');
      const data = await response.json();
      
      const prescriptionsData = data?.data?.prescriptions || [];
      setPrescriptions(prescriptionsData);
    } catch (error) {
      console.error('Erreur chargement prescriptions:', error);
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!selectedPrescription || !description.trim()) {
      alert('Veuillez saisir une description');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5005/api/prescriptions/${selectedPrescription._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'validated',
          description: description.trim()
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Ordonnance validée avec succès!');
        setShowModal(false);
        setDescription('');
        setSelectedPrescription(null);
        loadPrescriptions();
        // Mettre à jour le badge
        if (onNotificationUpdate) {
          onNotificationUpdate();
        }
      }
    } catch (error) {
      console.error('Erreur validation:', error);
      alert('Erreur lors de la validation');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'validated': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'validated': return 'Validée';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Clipboard className="h-6 w-6 mr-2 text-green-600" />
          Gestion des Ordonnances
        </h2>
        <div className="text-sm text-gray-600">
          {prescriptions.length} ordonnance(s) au total
        </div>
      </div>

      {prescriptions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Clipboard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune ordonnance
          </h3>
          <p className="text-gray-600">
            Les ordonnances envoyées par les clients apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date d'envoi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {prescriptions.map((prescription) => (
                  <tr key={prescription._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {prescription.clientName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {prescription.clientEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        {new Date(prescription.submittedAt).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(prescription.status)}`}>
                        {getStatusLabel(prescription.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setSelectedPrescription(prescription);
                          setDescription(prescription.description || '');
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de validation */}
      {showModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Ordonnance de {selectedPrescription.clientName}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Client</label>
                  <p className="text-sm text-gray-900">{selectedPrescription.clientName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900">{selectedPrescription.clientEmail}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image de l'ordonnance
                </label>
                <div className="border border-gray-300 rounded-lg p-4">
                  <img
                    src={selectedPrescription.imageUrl}
                    alt="Ordonnance"
                    className="max-w-full h-auto rounded"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=Image+Ordonnance';
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description / Validation
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Saisissez les médicaments prescrits et instructions..."
                  className="w-full p-3 border border-gray-300 rounded-md h-32 resize-none"
                  disabled={selectedPrescription.status === 'validated'}
                />
              </div>

              {selectedPrescription.status === 'pending' && (
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleValidate}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2"
                  >
                    <Check className="h-4 w-4" />
                    <span>Valider l'ordonnance</span>
                  </button>
                </div>
              )}

              {selectedPrescription.status === 'validated' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium">✅ Ordonnance validée</p>
                  <p className="text-green-700 text-sm mt-1">
                    Validée le {new Date(selectedPrescription.validatedAt).toLocaleString('fr-FR')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPrescriptionManager;