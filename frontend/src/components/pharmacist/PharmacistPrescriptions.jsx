import React, { useState, useEffect } from 'react';
import { 
  FileText, Eye, CheckCircle, XCircle, Clock, 
  User, Calendar, Pill, AlertTriangle, MessageSquare,
  Download, Edit, Send
} from 'lucide-react';

const PharmacistPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationNote, setValidationNote] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      const response = await fetch('/api/prescriptions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const formattedPrescriptions = data.map(p => ({
          id: p._id,
          patientName: p.clientId ? `${p.clientId.prenom} ${p.clientId.nom}` : p.clientName,
          patientPhone: p.clientId?.telephone || 'Non renseigné',
          uploadDate: p.submittedAt,
          status: p.status,
          imageUrl: p.imageUrl,
          medications: [],
          note: p.description || '',
          pharmacistNote: p.validatedBy || ''
        }));
        setPrescriptions(formattedPrescriptions);
      } else {
        setPrescriptions([]);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setPrescriptions([]);
    }
  };

  const filteredPrescriptions = prescriptions.filter(p => 
    filterStatus === 'all' || p.status === filterStatus
  );

  const handleValidate = (prescription, isApproved) => {
    setSelectedPrescription(prescription);
    setShowValidationModal(true);
    setValidationNote(isApproved ? 'Ordonnance validée et conforme.' : '');
  };

  const submitValidation = async () => {
    if (!selectedPrescription) return;

    try {
      const newStatus = validationNote.includes('validée') ? 'validated' : 'rejected';
      
      const response = await fetch(`/api/prescriptions/${selectedPrescription.id}/validate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: newStatus,
          validatedBy: validationNote
        })
      });

      if (response.ok) {
        const updatedPrescriptions = prescriptions.map(p => 
          p.id === selectedPrescription.id 
            ? { 
                ...p, 
                status: newStatus,
                pharmacistNote: validationNote
              }
            : p
        );
        
        setPrescriptions(updatedPrescriptions);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
    
    setShowValidationModal(false);
    setSelectedPrescription(null);
    setValidationNote('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'validated': return 'green';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'validated': return 'Validée';
      case 'rejected': return 'Rejetée';
      default: return 'Inconnu';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Gestion des Ordonnances</h3>
            <p className="text-gray-600 dark:text-gray-300">{filteredPrescriptions.length} ordonnance{filteredPrescriptions.length > 1 ? 's' : ''}</p>
          </div>
        </div>
        
        {/* Filtres */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="all">Toutes</option>
          <option value="pending">En attente</option>
          <option value="validated">Validées</option>
          <option value="rejected">Rejetées</option>
        </select>
      </div>

      {/* Liste des ordonnances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPrescriptions.map((prescription) => {
          const statusColor = getStatusColor(prescription.status);
          return (
            <div key={prescription.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              {/* Header de la carte */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{prescription.patientName}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{prescription.patientPhone}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-800 dark:bg-${statusColor}-900/50 dark:text-${statusColor}-200`}>
                  {getStatusLabel(prescription.status)}
                </span>
              </div>

              {/* Image de l'ordonnance */}
              <div className="mb-4">
                <img 
                  src={prescription.imageUrl || '/images/prescription-placeholder.jpg'} 
                  alt="Ordonnance"
                  className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200/e5e7eb/6b7280?text=Ordonnance';
                  }}
                />
              </div>

              {/* Informations */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(prescription.uploadDate).toLocaleString('fr-FR')}
                </div>
                
                {prescription.medications.length > 0 && (
                  <div className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                    <Pill className="h-4 w-4 mr-2 mt-0.5" />
                    <div>
                      {prescription.medications.map((med, index) => (
                        <span key={index} className="block">{med}</span>
                      ))}
                    </div>
                  </div>
                )}

                {prescription.note && (
                  <div className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                    <MessageSquare className="h-4 w-4 mr-2 mt-0.5" />
                    <span>{prescription.note}</span>
                  </div>
                )}

                {prescription.pharmacistNote && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-sm">
                    <p className="font-medium text-blue-800 dark:text-blue-200">Note du pharmacien:</p>
                    <p className="text-blue-700 dark:text-blue-300">{prescription.pharmacistNote}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button 
                  onClick={() => window.open(prescription.imageUrl, '_blank')}
                  className="flex-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors flex items-center justify-center space-x-1"
                >
                  <Eye className="h-4 w-4" />
                  <span>Voir</span>
                </button>
                
                {prescription.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => handleValidate(prescription, true)}
                      className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-1"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Valider</span>
                    </button>
                    <button 
                      onClick={() => handleValidate(prescription, false)}
                      className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-1"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Rejeter</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Message si aucune ordonnance */}
      {filteredPrescriptions.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Aucune ordonnance</h3>
          <p className="text-gray-600 dark:text-gray-300">
            {filterStatus === 'all' 
              ? "Aucune ordonnance disponible pour le moment"
              : `Aucune ordonnance ${getStatusLabel(filterStatus).toLowerCase()}`
            }
          </p>
        </div>
      )}

      {/* Modal de validation */}
      {showValidationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Validation de l'ordonnance
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Patient: <strong>{selectedPrescription?.patientName}</strong>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Note de validation
              </label>
              <textarea
                value={validationNote}
                onChange={(e) => setValidationNote(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Ajoutez une note de validation..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowValidationModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={submitValidation}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacistPrescriptions;