import React, { useState, useEffect } from 'react';
import { Clipboard, Eye, Check, X, Download, User, Calendar, FileText } from 'lucide-react';
import apiService from '../services/api.jsx';

const AdminPrescriptionsManager = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllPrescriptions();
      setPrescriptions(response || []);
    } catch (error) {
      console.error('Erreur lors du chargement des ordonnances:', error);
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const updatePrescriptionStatus = async (prescriptionId, status) => {
    try {
      await apiService.updatePrescriptionStatus(prescriptionId, status);
      await loadPrescriptions(); // Recharger la liste
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvée';
      case 'rejected': return 'Rejetée';
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Clipboard className="h-6 w-6 mr-2 text-green-600" />
          Gestion des Ordonnances
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {prescriptions.length} ordonnance(s) au total
        </div>
      </div>

      {prescriptions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <Clipboard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucune ordonnance
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Les ordonnances envoyées par les clients apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date d'envoi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {prescriptions.map((prescription) => (
                  <tr key={prescription._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {prescription.clientId?.prenom} {prescription.clientId?.nom}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {prescription.clientId?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900 dark:text-white">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        {new Date(prescription.createdAt).toLocaleDateString('fr-FR')}
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
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {prescription.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updatePrescriptionStatus(prescription._id, 'approved')}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => updatePrescriptionStatus(prescription._id, 'rejected')}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de visualisation */}
      {showModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Ordonnance de {selectedPrescription.clientId?.prenom} {selectedPrescription.clientId?.nom}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Client</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedPrescription.clientId?.prenom} {selectedPrescription.clientId?.nom}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedPrescription.clientId?.email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date d'envoi</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(selectedPrescription.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Statut</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPrescription.status)}`}>
                    {getStatusLabel(selectedPrescription.status)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image de l'ordonnance
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                  <img
                    src={selectedPrescription.imageUrl}
                    alt="Ordonnance"
                    className="max-w-full h-auto rounded"
                  />
                </div>
              </div>

              {selectedPrescription.status === 'pending' && (
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      updatePrescriptionStatus(selectedPrescription._id, 'approved');
                      setShowModal(false);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2"
                  >
                    <Check className="h-4 w-4" />
                    <span>Approuver</span>
                  </button>
                  <button
                    onClick={() => {
                      updatePrescriptionStatus(selectedPrescription._id, 'rejected');
                      setShowModal(false);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Rejeter</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPrescriptionsManager;