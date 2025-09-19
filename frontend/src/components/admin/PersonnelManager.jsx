import React, { useState, useEffect } from 'react';
import { Users, Trash2, UserCheck, UserX } from 'lucide-react';
import { API_BASE_URL } from '../../config/api.js';

const PersonnelManager = () => {
  const [pharmacists, setPharmacists] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPersonnel();
  }, []);

  const loadPersonnel = async () => {
    try {
      const [pharmacistsRes, clientsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/personnel/pharmacists`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`${API_BASE_URL}/api/personnel/clients`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (pharmacistsRes.ok) {
        const pharmacistsData = await pharmacistsRes.json();
        setPharmacists(pharmacistsData.data || []);
      }

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setClients(clientsData.data || []);
      }
    } catch (error) {
      console.error('Erreur chargement personnel:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId, userType) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/personnel/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        if (userType === 'pharmacist') {
          setPharmacists(prev => prev.filter(p => p._id !== userId));
        } else {
          setClients(prev => prev.filter(c => c._id !== userId));
        }
        alert('Utilisateur supprimé avec succès');
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pharmaciens */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
            <UserCheck className="h-5 w-5 mr-2 text-green-600" />
            Pharmaciens ({pharmacists.length})
          </h4>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 max-h-96 overflow-y-auto">
          {pharmacists.length === 0 ? (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <p>Aucun pharmacien inscrit</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pharmacists.map((pharmacist) => (
                <div key={pharmacist._id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {pharmacist.prenom} {pharmacist.nom}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{pharmacist.email}</p>
                    <p className="text-xs text-green-600">Pharmacien</p>
                  </div>
                  <button
                    onClick={() => deleteUser(pharmacist._id, 'pharmacist')}
                    className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Clients */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
            <UserX className="h-5 w-5 mr-2 text-blue-600" />
            Clients ({clients.length})
          </h4>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 max-h-96 overflow-y-auto">
          {clients.length === 0 ? (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <p>Aucun client inscrit</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clients.map((client) => (
                <div key={client._id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {client.prenom} {client.nom}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{client.email}</p>
                    <p className="text-xs text-blue-600">Client</p>
                  </div>
                  <button
                    onClick={() => deleteUser(client._id, 'client')}
                    className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonnelManager;