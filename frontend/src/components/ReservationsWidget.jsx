import React, { useState } from 'react';
import { Package, Clock, CheckCircle, XCircle, Eye, Trash2, Calendar } from 'lucide-react';

const ReservationsWidget = ({ reservations, onViewDetails, onCancelReservation }) => {
  const [showAll, setShowAll] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'validated': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'picked_up': return 'text-green-600 bg-green-100 border-green-200';
      case 'cancelled': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'validated': return <CheckCircle className="h-4 w-4" />;
      case 'picked_up': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'validated': return 'Validée';
      case 'picked_up': return 'Retirée';
      case 'cancelled': return 'Annulée';
      default: return 'Inconnu';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const displayedReservations = showAll ? reservations : reservations.slice(0, 3);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900 flex items-center">
          <Package className="h-5 w-5 mr-2" />
          Mes réservations en cours
        </h4>
        {reservations.length > 0 && (
          <span className="text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded-full">
            {reservations.length}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {displayedReservations.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Aucune réservation en cours</p>
            <p className="text-sm text-gray-400">Commencez par ajouter des produits à votre panier</p>
          </div>
        ) : (
          displayedReservations.map((reservation) => (
            <div 
              key={reservation._id} 
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    Réservation #{reservation._id.slice(-6)}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full border flex items-center space-x-1 ${getStatusColor(reservation.status)}`}>
                    {getStatusIcon(reservation.status)}
                    <span>{getStatusText(reservation.status)}</span>
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {reservation.totalAmount.toFixed(2)} €
                  </p>
                  <p className="text-xs text-gray-500">
                    {reservation.items.length} article(s)
                  </p>
                </div>
              </div>

              {/* Items Preview */}
              <div className="mb-3">
                <div className="space-y-2">
                  {reservation.items.slice(0, 2).map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <div className="w-6 h-6 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {item.product?.images && item.product.images.length > 0 ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="h-4 w-4 text-gray-400 m-auto" />
                        )}
                      </div>
                      <span className="text-gray-600 truncate flex-1">
                        {item.product?.name || 'Produit'}
                      </span>
                      <span className="text-gray-900 font-medium">x{item.quantity}</span>
                    </div>
                  ))}
                  {reservation.items.length > 2 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{reservation.items.length - 2} autre(s) article(s)
                    </p>
                  )}
                </div>
              </div>

              {/* Date and Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(reservation.createdAt)}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onViewDetails(reservation)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
                  >
                    <Eye className="h-3 w-3" />
                    <span>Détails</span>
                  </button>
                  
                  {reservation.status === 'pending' && (
                    <button
                      onClick={() => onCancelReservation(reservation._id)}
                      className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center space-x-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Annuler</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Show More/Less Button */}
        {reservations.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium mt-2 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {showAll ? 'Voir moins' : `Voir toutes (${reservations.length})`}
          </button>
        )}

        {/* Quick Actions */}
        {reservations.length > 0 && (
          <div className="pt-3 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-2">
              <button className="text-xs bg-primary-50 text-primary-600 py-2 px-3 rounded-lg hover:bg-primary-100 transition-colors">
                Historique complet
              </button>
              <button className="text-xs bg-gray-50 text-gray-600 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors">
                Suivi en temps réel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationsWidget;
