import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Eye, Download, RefreshCw, Search, Filter,
  CheckCircle, XCircle, Clock, DollarSign, User, Package,
  Truck, CreditCard, FileText
} from 'lucide-react';

const AdminOrdersManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const mockOrders = [
        {
          id: 'CMD001',
          client: {
            name: 'Marie Diallo',
            email: 'marie.diallo@email.com',
            phone: '+224623841149',
            address: 'Madina, Conakry'
          },
          items: [
            { name: 'Paracétamol 500mg', quantity: 2, price: 15000 },
            { name: 'Vitamine C', quantity: 1, price: 12000 }
          ],
          total: 27000,
          status: 'completed',
          paymentMethod: 'cash',
          createdAt: '2024-08-26T10:30:00Z',
          completedAt: '2024-08-26T11:15:00Z',
          type: 'online'
        },
        {
          id: 'CMD002',
          client: {
            name: 'Ahmed Camara',
            email: 'ahmed.camara@email.com',
            phone: '+224664123456',
            address: 'Kaloum, Conakry'
          },
          items: [
            { name: 'Amoxicilline 250mg', quantity: 1, price: 25000 },
            { name: 'Ibuprofène 400mg', quantity: 2, price: 36000 }
          ],
          total: 61000,
          status: 'pending',
          paymentMethod: 'mobile_money',
          createdAt: '2024-08-26T09:45:00Z',
          type: 'online'
        },
        {
          id: 'POS001',
          client: {
            name: 'Fatou Barry',
            phone: '+224612345678'
          },
          items: [
            { name: 'Aspirine 100mg', quantity: 3, price: 18000 },
            { name: 'Sirop contre la toux', quantity: 1, price: 15000 }
          ],
          total: 33000,
          status: 'completed',
          paymentMethod: 'cash',
          createdAt: '2024-08-26T14:20:00Z',
          completedAt: '2024-08-26T14:25:00Z',
          type: 'pos'
        },
        {
          id: 'CMD003',
          client: {
            name: 'Mamadou Bah',
            email: 'mamadou.bah@email.com',
            phone: '+224655987654',
            address: 'Ratoma, Conakry'
          },
          items: [
            { name: 'Doliprane 1000mg', quantity: 1, price: 18000 }
          ],
          total: 18000,
          status: 'cancelled',
          paymentMethod: 'card',
          createdAt: '2024-08-25T16:30:00Z',
          cancelledAt: '2024-08-25T17:00:00Z',
          type: 'online'
        }
      ];
      
      setOrders(mockOrders);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'En cours';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      case 'shipped': return 'Expédiée';
      default: return 'Inconnu';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'shipped': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'cash': return 'Espèces';
      case 'card': return 'Carte';
      case 'mobile_money': return 'Mobile Money';
      default: return 'Inconnu';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'online': return 'En ligne';
      case 'pos': return 'Point de vente';
      default: return 'Inconnu';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            status: newStatus,
            ...(newStatus === 'completed' && { completedAt: new Date().toISOString() }),
            ...(newStatus === 'cancelled' && { cancelledAt: new Date().toISOString() })
          }
        : order
    ));
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

  const getTotalRevenue = () => {
    return filteredOrders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + order.total, 0);
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
          <ShoppingCart className="h-6 w-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Gestion des commandes</h2>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
            {filteredOrders.length} commandes
          </span>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={loadOrders}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Total commandes</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{filteredOrders.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Terminées</span>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {filteredOrders.filter(o => o.status === 'completed').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium text-gray-600">En cours</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {filteredOrders.filter(o => o.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Chiffre d'affaires</span>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {getTotalRevenue().toLocaleString()} GNF
          </p>
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
                placeholder="Rechercher par client, ID ou produit..."
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
              <option value="pending">En cours</option>
              <option value="completed">Terminées</option>
              <option value="cancelled">Annulées</option>
              <option value="shipped">Expédiées</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Commande</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Client</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Articles</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Total</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Type</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Statut</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Date</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-900">#{order.id}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <CreditCard className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-600">{getPaymentMethodLabel(order.paymentMethod)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-900">{order.client.name}</p>
                      {order.client.phone && (
                        <p className="text-sm text-gray-600">{order.client.phone}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-sm text-gray-900">{order.items.length} article(s)</p>
                      <p className="text-xs text-gray-600">{order.items[0]?.name}
                        {order.items.length > 1 && ` +${order.items.length - 1} autre(s)`}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-semibold text-gray-900">{order.total.toLocaleString()} GNF</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      order.type === 'online' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {order.type === 'online' ? <Package className="h-3 w-3 mr-1" /> : <Truck className="h-3 w-3 mr-1" />}
                      {getTypeLabel(order.type)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-600">{formatDate(order.createdAt)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      {order.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleUpdateStatus(order.id, 'completed')}
                            className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
                            title="Marquer comme terminée"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                            title="Annuler"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => handleViewDetails(order)}
                        className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                        title="Voir détails"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded">
                        <FileText className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune commande trouvée</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Aucune commande ne correspond à vos critères de recherche.' 
              : 'Aucune commande pour le moment.'}
          </p>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Détails de la commande #{selectedOrder.id}
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
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Informations client
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p><span className="font-medium">Nom:</span> {selectedOrder.client.name}</p>
                    {selectedOrder.client.email && (
                      <p><span className="font-medium">Email:</span> {selectedOrder.client.email}</p>
                    )}
                    {selectedOrder.client.phone && (
                      <p><span className="font-medium">Téléphone:</span> {selectedOrder.client.phone}</p>
                    )}
                    {selectedOrder.client.address && (
                      <p><span className="font-medium">Adresse:</span> {selectedOrder.client.address}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Informations commande</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Statut:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusLabel(selectedOrder.status)}
                      </span>
                    </div>
                    <p><span className="font-medium">Type:</span> {getTypeLabel(selectedOrder.type)}</p>
                    <p><span className="font-medium">Paiement:</span> {getPaymentMethodLabel(selectedOrder.paymentMethod)}</p>
                    <p><span className="font-medium">Date:</span> {formatDate(selectedOrder.createdAt)}</p>
                    {selectedOrder.completedAt && (
                      <p><span className="font-medium">Terminée le:</span> {formatDate(selectedOrder.completedAt)}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Articles commandés
                </h4>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left py-2 px-4 font-medium text-gray-700">Produit</th>
                        <th className="text-left py-2 px-4 font-medium text-gray-700">Quantité</th>
                        <th className="text-left py-2 px-4 font-medium text-gray-700">Prix unitaire</th>
                        <th className="text-left py-2 px-4 font-medium text-gray-700">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index} className="border-t border-gray-200">
                          <td className="py-2 px-4">{item.name}</td>
                          <td className="py-2 px-4">{item.quantity}</td>
                          <td className="py-2 px-4">{(item.price / item.quantity).toLocaleString()} GNF</td>
                          <td className="py-2 px-4 font-medium">{item.price.toLocaleString()} GNF</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-gray-300 bg-gray-100">
                        <td colSpan="3" className="py-2 px-4 font-medium text-right">Total:</td>
                        <td className="py-2 px-4 font-bold text-lg">{selectedOrder.total.toLocaleString()} GNF</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button 
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Fermer
              </button>
              {selectedOrder.status === 'pending' && (
                <>
                  <button 
                    onClick={() => {
                      handleUpdateStatus(selectedOrder.id, 'completed');
                      setShowDetails(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Marquer comme terminée
                  </button>
                  <button 
                    onClick={() => {
                      handleUpdateStatus(selectedOrder.id, 'cancelled');
                      setShowDetails(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Annuler
                  </button>
                </>
              )}
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Imprimer facture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersManager;
