import React, { useState, useEffect } from 'react';
import { 
  Calendar, CheckCircle, XCircle, Eye, Clock, User, Package,
  Search, Filter, Download, RefreshCw, Phone, Mail, MapPin
} from 'lucide-react';
import apiService from '../services/api.jsx';

const AdminReservationsManager = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const reservationsData = await apiService.getReservations();
      const realReservations = (Array.isArray(reservationsData) ? reservationsData : reservationsData?.reservations || []).map(reservation => ({
        id: reservation._id || reservation.id,
        client: {
          name: reservation.userId?.prenom && reservation.userId?.nom 
            ? `${reservation.userId.prenom} ${reservation.userId.nom}` 
            : reservation.clientName || 'Client inconnu',
          email: reservation.userId?.email || reservation.clientEmail || 'N/A',
          phone: reservation.userId?.telephone || reservation.clientPhone || 'N/A',
          address: reservation.userId?.adresse || reservation.clientAddress || 'N/A'
        },
        product: {
          name: reservation.productId?.name || reservation.productName || 'Produit inconnu',
          brand: reservation.productId?.brand || reservation.productBrand || 'N/A',
          quantity: reservation.quantity || 1,
          price: (reservation.productId?.price || reservation.productPrice || 0) * (reservation.quantity || 1)
        },
        status: reservation.status || 'pending',
        createdAt: reservation.createdAt || new Date().toISOString(),
        validatedAt: reservation.validatedAt,
        pickedUpAt: reservation.pickedUpAt,
        cancelledAt: reservation.cancelledAt,
        notes: reservation.notes || '',
        priority: reservation.priority || 'normal'
      }));
      
      setReservations(realReservations);
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'validated': return 'Validée';
      case 'picked_up': return 'Retirée';
      case 'cancelled': return 'Annulée';
      default: return 'Inconnu';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'validated': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'picked_up': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'normal': return 'border-l-blue-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = reservation.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleValidateReservation = async (reservationId) => {
    try {
      // Update in database if API exists
      // await apiService.updateReservation(reservationId, { status: 'validated' });
      
      setReservations(prev => prev.map(reservation => 
        reservation.id === reservationId 
          ? { ...reservation, status: 'validated', validatedAt: new Date().toISOString() }
          : reservation
      ));
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    try {
      // Update in database if API exists
      // await apiService.updateReservation(reservationId, { status: 'cancelled' });
      
      setReservations(prev => prev.map(reservation => 
        reservation.id === reservationId 
          ? { ...reservation, status: 'cancelled', cancelledAt: new Date().toISOString() }
          : reservation
      ));
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
    }
  };

  const handleMarkAsPickedUp = async (reservationId) => {
    try {
      // Update in database if API exists
      // await apiService.updateReservation(reservationId, { status: 'picked_up' });
      
      setReservations(prev => prev.map(reservation => 
        reservation.id === reservationId 
          ? { ...reservation, status: 'picked_up', pickedUpAt: new Date().toISOString() }
          : reservation
      ));
    } catch (error) {
      console.error('Erreur lors du marquage:', error);
    }
  };

  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
    setShowDetails(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Calendar className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Gestion des réservations</h2>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
            {filteredReservations.length} réservations
          </span>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={loadReservations}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualiser</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par client, produit ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="validated">Validées</option>
              <option value="picked_up">Retirées</option>
              <option value="cancelled">Annulées</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reservations List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Réservation</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Client</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Produit</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Date</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Statut</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((reservation) => (
                <tr key={reservation.id} className={`border-b border-gray-100 hover:bg-gray-50 border-l-4 ${getPriorityColor(reservation.priority)}`}>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-900">#{reservation.id}</p>
                      <p className="text-sm text-gray-600">{reservation.product.quantity} unité(s)</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-900">{reservation.client.name}</p>
                      <p className="text-sm text-gray-600">{reservation.client.phone}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-900">{reservation.product.name}</p>
                      <p className="text-sm text-gray-600">{reservation.product.brand}</p>
                      <p className="text-sm font-medium text-green-600">{reservation.product.price.toLocaleString()} GNF</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-600">{formatDate(reservation.createdAt)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(reservation.status)}`}>
                      {getStatusLabel(reservation.status)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      {reservation.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleValidateReservation(reservation.id)}
                            className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
                            title="Valider"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleCancelReservation(reservation.id)}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                            title="Annuler"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {reservation.status === 'validated' && (
                        <button 
                          onClick={() => handleMarkAsPickedUp(reservation.id)}
                          className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                          Marquer comme retiré
                        </button>
                      )}
                      <button 
                        onClick={() => handleViewDetails(reservation)}
                        className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                        title="Voir détails"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredReservations.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune réservation trouvée</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Aucune réservation ne correspond à vos critères de recherche.' 
              : 'Aucune réservation pour le moment.'}
          </p>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Détails de la réservation #{selectedReservation.id}
                </h3>
                <button 
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Client Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Informations client
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p><span className="font-medium">Nom:</span> {selectedReservation.client.name}</p>
                  <div className="flex items-center space-x-1">
                    <Mail className="h-3 w-3 text-gray-400" />
                    <span>{selectedReservation.client.email}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Phone className="h-3 w-3 text-gray-400" />
                    <span>{selectedReservation.client.phone}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span>{selectedReservation.client.address}</span>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Produit réservé
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p><span className="font-medium">Produit:</span> {selectedReservation.product.name}</p>
                  <p><span className="font-medium">Marque:</span> {selectedReservation.product.brand}</p>
                  <p><span className="font-medium">Quantité:</span> {selectedReservation.product.quantity} unité(s)</p>
                  <p><span className="font-medium">Prix total:</span> {selectedReservation.product.price.toLocaleString()} GNF</p>
                </div>
              </div>

              {/* Status & Dates */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Statut et dates</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Statut:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedReservation.status)}`}>
                      {getStatusLabel(selectedReservation.status)}
                    </span>
                  </div>
                  <p><span className="font-medium">Créée le:</span> {formatDate(selectedReservation.createdAt)}</p>
                  {selectedReservation.validatedAt && (
                    <p><span className="font-medium">Validée le:</span> {formatDate(selectedReservation.validatedAt)}</p>
                  )}
                  {selectedReservation.pickedUpAt && (
                    <p><span className="font-medium">Retirée le:</span> {formatDate(selectedReservation.pickedUpAt)}</p>
                  )}
                  {selectedReservation.cancelledAt && (
                    <p><span className="font-medium">Annulée le:</span> {formatDate(selectedReservation.cancelledAt)}</p>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedReservation.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Notes</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedReservation.notes}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button 
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Fermer
              </button>
              {selectedReservation.status === 'pending' && (
                <>
                  <button 
                    onClick={() => {
                      handleValidateReservation(selectedReservation.id);
                      setShowDetails(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Valider
                  </button>
                  <button 
                    onClick={() => {
                      handleCancelReservation(selectedReservation.id);
                      setShowDetails(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Annuler
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReservationsManager;
