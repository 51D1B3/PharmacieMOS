import React, { useState, useEffect } from 'react';
import { 
  Package, Truck, Calendar, Eye, Search, Filter, RefreshCw,
  Download, Plus, CheckCircle, Clock, AlertTriangle, Phone,
  Mail, MapPin, DollarSign, Edit, FileText
} from 'lucide-react';
import apiService from '../services/api.jsx';

const AdminSuppliersManager = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    loadSuppliersData();
  }, []);

  const loadSuppliersData = async () => {
    try {
      setLoading(true);
      
      // Charger les vraies données des fournisseurs
      const suppliersData = await apiService.getSuppliers();
      const realSuppliers = (Array.isArray(suppliersData) ? suppliersData : suppliersData?.suppliers || []).map(supplier => ({
        id: supplier._id || supplier.id,
        name: supplier.name || 'Fournisseur inconnu',
        contact: {
          email: supplier.email || 'N/A',
          phone: supplier.phone || 'N/A',
          address: supplier.address?.street && supplier.address?.city 
            ? `${supplier.address.street}, ${supplier.address.city}` 
            : supplier.address || 'N/A'
        },
        status: supplier.isActive ? 'active' : 'inactive',
        totalOrders: 0, // Sera calculé dynamiquement
        totalValue: 0, // Sera calculé dynamiquement
        lastOrder: supplier.updatedAt || supplier.createdAt || new Date().toISOString(),
        reliability: 95, // Valeur par défaut, à calculer selon l'historique
        deliveryTime: 3, // Valeur par défaut
        contactPerson: supplier.contactPerson || 'N/A',
        notes: supplier.notes || ''
      }));
      
      // Pour les commandes, on utilise des données simulées car il n'y a pas encore d'endpoint pour les commandes fournisseurs
      const mockOrders = realSuppliers.length > 0 ? [
        {
          id: 'PO001',
          supplier: realSuppliers[0],
          orderNumber: `CMD-${new Date().getFullYear()}-001`,
          items: [
            { name: 'Médicaments divers', quantity: 100, unitPrice: 1000, total: 100000 }
          ],
          totalAmount: 100000,
          status: 'pending',
          orderDate: new Date().toISOString(),
          expectedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Commande de réapprovisionnement'
        }
      ] : [];
      
      setSuppliers(realSuppliers);
      setOrders(mockOrders);
    } catch (error) {
      console.error('Erreur lors du chargement des données fournisseurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'shipped': return 'Expédiée';
      case 'delivered': return 'Livrée';
      case 'delayed': return 'Retardée';
      case 'cancelled': return 'Annulée';
      default: return 'Inconnu';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'shipped': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'delayed': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getReliabilityColor = (reliability) => {
    if (reliability >= 95) return 'text-green-600';
    if (reliability >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
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

  const formatCurrency = (amount) => {
    return amount.toLocaleString() + ' GNF';
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
          <Package className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">Gestion des fournisseurs</h2>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={loadSuppliersData}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualiser</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            <Plus className="h-4 w-4" />
            <span>Nouvelle commande</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'orders'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Commandes fournisseurs
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'suppliers'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Liste des fournisseurs
        </button>
      </div>

      {activeTab === 'orders' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-gray-600">En attente</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {orders.filter(o => o.status === 'pending').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <div className="flex items-center space-x-2">
                <Truck className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Expédiées</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {orders.filter(o => o.status === 'shipped').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Livrées</span>
              </div>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {orders.filter(o => o.status === 'delivered').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-gray-600">Retardées</span>
              </div>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {orders.filter(o => o.status === 'delayed').length}
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
                    placeholder="Rechercher par fournisseur, numéro de commande ou produit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="shipped">Expédiées</option>
                  <option value="delivered">Livrées</option>
                  <option value="delayed">Retardées</option>
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
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Fournisseur</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Articles</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Montant</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Statut</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Livraison prévue</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                          <p className="text-sm text-gray-600">{formatDate(order.orderDate)}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">{order.supplier.name}</p>
                          <p className="text-sm text-gray-600">{order.supplier.contact.phone}</p>
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
                        <p className="font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-600">{formatDate(order.expectedDelivery)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleViewDetails(order)}
                            className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                            title="Voir détails"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded">
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
        </>
      )}

      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-purple-100">
                    <Package className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
                    <p className="text-sm text-gray-600">ID: {supplier.id}</p>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
                  Actif
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{supplier.contact.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-3 w-3" />
                  <span>{supplier.contact.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{supplier.contact.address}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Total commandes</p>
                  <p className="font-semibold text-gray-900">{supplier.totalOrders}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Valeur totale</p>
                  <p className="font-semibold text-green-600">{formatCurrency(supplier.totalValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Fiabilité</p>
                  <p className={`font-semibold ${getReliabilityColor(supplier.reliability)}`}>
                    {supplier.reliability}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Délai moyen</p>
                  <p className="font-semibold text-blue-600">{supplier.deliveryTime} jours</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>Dernière commande: {formatDate(supplier.lastOrder)}</span>
                </div>
                <div className="flex space-x-2">
                  <button className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded">
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Commande #{selectedOrder.orderNumber}
                </h3>
                <button 
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Order & Supplier Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Informations fournisseur</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p><span className="font-medium">Nom:</span> {selectedOrder.supplier.name}</p>
                    <p><span className="font-medium">Email:</span> {selectedOrder.supplier.contact.email}</p>
                    <p><span className="font-medium">Téléphone:</span> {selectedOrder.supplier.contact.phone}</p>
                    <p><span className="font-medium">Adresse:</span> {selectedOrder.supplier.contact.address}</p>
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
                    <p><span className="font-medium">Date commande:</span> {formatDate(selectedOrder.orderDate)}</p>
                    <p><span className="font-medium">Livraison prévue:</span> {formatDate(selectedOrder.expectedDelivery)}</p>
                    {selectedOrder.trackingNumber && (
                      <p><span className="font-medium">Numéro de suivi:</span> {selectedOrder.trackingNumber}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Articles commandés</h4>
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
                          <td className="py-2 px-4">{formatCurrency(item.unitPrice)}</td>
                          <td className="py-2 px-4 font-medium">{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-gray-300 bg-gray-100">
                        <td colSpan="3" className="py-2 px-4 font-medium text-right">Total:</td>
                        <td className="py-2 px-4 font-bold text-lg">{formatCurrency(selectedOrder.totalAmount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Notes</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedOrder.notes}</p>
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
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Modifier
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Bon de commande
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSuppliersManager;
