import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, Package, AlertTriangle, Calendar, 
  Users, FileText,
  DollarSign, Settings, LogOut, User,
  Bell, ArrowUp, ArrowDown, ChevronDown, TrendingUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import apiService from '../services/api.jsx';
import AdminProductAlerts from './AdminProductAlerts.jsx';
import AdminReservationsManager from './AdminReservationsManager.jsx';
import AdminClientsManager from './AdminClientsManager.jsx';
import AdminSuppliersManager from './AdminSuppliersManager.jsx';
import AdminInvoicesManager from './AdminInvoicesManager.jsx';
import AdminQuickActions from './AdminQuickActions.jsx';
import AdminChatNotification from './AdminChatNotification.jsx';
import AdminCashSale from './AdminCashSale.jsx';
import AdminDailySales from './AdminDailySales.jsx';
import AdminProductsManager from './AdminProductsManager.jsx';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [stats, setStats] = useState({
    dailySales: 0,
    weeklySales: 0,
    monthlySales: 0,
    reservations: 0,
    revenue: 0,
    lowStockProducts: 0,
    activeClients: 0,
    unreadMessages: 0
  });
  const [recentData, setRecentData] = useState({
    orders: [],
    reservations: [],
    products: [],
    clients: [],
    messages: [],
    suppliers: [],
    invoices: []
  });
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadAdminData();
    loadNotifications();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from API
      const [productsData, reservationsData, ordersData, usersData, suppliersData] = await Promise.all([
        apiService.getProducts({ limit: 100 }),
        apiService.getReservations(),
        apiService.getOrders().catch(() => []), // Fallback if orders endpoint doesn't exist
        apiService.getUsers().catch(() => []), // Fallback if users endpoint doesn't exist
        apiService.getSuppliers().catch(() => []) // Fallback if suppliers endpoint doesn't exist
      ]);

      // Calculate real stats from data
      const products = productsData?.data ?? [];
      const reservations = Array.isArray(reservationsData) ? reservationsData : (reservationsData?.data ?? []);
      const orders = Array.isArray(ordersData) ? ordersData : (ordersData?.data ?? []);
      const users = Array.isArray(usersData) ? usersData : (usersData?.data ?? []);
      const suppliers = Array.isArray(suppliersData) ? suppliersData : (suppliersData?.data ?? []);

      // Calculate low stock products
      const lowStockProducts = products.filter(product => 
        (product.stock?.onHand || 0) < (product.stock?.thresholdAlert || 10)
      ).length;

      // Calculate stats
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const dailyOrders = orders.filter(order => 
        order.createdAt && order.createdAt.startsWith(todayStr)
      );
      
      const weeklyOrders = orders.filter(order => 
        order.createdAt && new Date(order.createdAt) >= weekAgo
      );

      const monthlyOrders = orders.filter(order => 
        order.createdAt && new Date(order.createdAt) >= monthAgo
      );

      const calculatedStats = {
        dailySales: dailyOrders.length,
        weeklySales: weeklyOrders.length,
        monthlySales: monthlyOrders.length,
        reservations: reservations.length,
        revenue: monthlyOrders.reduce((sum, order) => sum + (order.total || 0), 0),
        lowStockProducts: lowStockProducts,
        activeClients: users.filter(user => user.role === 'client').length,
        unreadMessages: 0 // Will be updated by chat context
      };

      const realRecentData = {
        orders: orders.slice(0, 5).map(order => ({
          id: order._id || order.id,
          client: order.clientName || 'Client',
          amount: order.total || 0,
          status: order.status || 'pending',
          date: order.createdAt ? order.createdAt.split('T')[0] : todayStr
        })),
        reservations: reservations.slice(0, 5).map(reservation => ({
          id: reservation._id || reservation.id,
          client: reservation.userId?.prenom && reservation.userId?.nom 
            ? `${reservation.userId.prenom} ${reservation.userId.nom}` 
            : reservation.clientName || 'Client',
          product: reservation.productId?.name || reservation.productName || 'Produit',
          status: reservation.status || 'pending',
          date: reservation.createdAt ? reservation.createdAt.split('T')[0] : todayStr,
          quantity: reservation.quantity || 1
        })),
        products: products.filter(product => 
          (product.stock?.onHand || 0) < (product.stock?.thresholdAlert || 10)
        ).slice(0, 5).map(product => ({
          id: product._id || product.id,
          name: product.name || 'Produit',
          stock: product.stock?.onHand || 0,
          threshold: product.stock?.thresholdAlert || 10,
          status: (product.stock?.onHand || 0) < 5 ? 'critical' : 'low'
        })),
        clients: users.filter(user => user.role === 'client').slice(0, 5).map(client => ({
          id: client._id || client.id,
          name: `${client.prenom || ''} ${client.nom || ''}`.trim() || client.name || 'Client',
          email: client.email || 'email@example.com',
          lastPurchase: orders.find(order => order.clientId === client._id)?.createdAt?.split('T')[0] || todayStr,
          totalSpent: orders.filter(order => order.clientId === client._id).reduce((sum, order) => sum + (order.total || 0), 0)
        })),
        messages: [], // Will be populated from chat context
        suppliers: suppliers.slice(0, 5).map(supplier => ({
          id: supplier._id || supplier.id,
          name: supplier.name || 'Fournisseur',
          contactPerson: supplier.contactPerson || 'N/A',
          email: supplier.email || 'N/A',
          phone: supplier.phone || 'N/A',
          status: supplier.isActive ? 'active' : 'inactive',
          lastContact: supplier.updatedAt ? supplier.updatedAt.split('T')[0] : todayStr
        })),
        invoices: orders.slice(0, 5).map(order => ({
          id: order._id || order.id,
          client: order.clientName || 'Client',
          amount: order.total || 0,
          date: order.createdAt ? order.createdAt.split('T')[0] : todayStr,
          type: 'invoice'
        }))
      };

      setStats(calculatedStats);
      setRecentData(realRecentData);
    } catch (error) {
      console.error('Erreur lors du chargement des données admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = () => {
    const mockNotifications = [
      {
        id: 1,
        type: 'stock',
        title: 'Stock critique',
        message: 'Aspirine 100mg - Stock: 2 unités',
        time: '5 min',
        priority: 'high'
      },
      {
        id: 2,
        type: 'reservation',
        title: 'Nouvelle réservation',
        message: 'Mamadou Bah - Paracétamol 500mg',
        time: '15 min',
        priority: 'medium'
      },
      {
        id: 3,
        type: 'expiry',
        title: 'Produits bientôt périmés',
        message: '5 produits expirent dans 30 jours',
        time: '1h',
        priority: 'medium'
      }
    ];
    setNotifications(mockNotifications);
  };

  const StatCard = ({ title, value, icon: Icon, trend, color = "primary" }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600 mt-1`}>{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const TabButton = ({ id, label, icon: Icon, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        active 
          ? 'bg-green-100 text-green-700 border border-green-200' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Ventes du jour"
          value={stats.dailySales}
          icon={BarChart3}
          trend={12}
          color="green"
        />
        <StatCard
          title="Réservations"
          value={stats.reservations}
          icon={Calendar}
          trend={-5}
          color="blue"
        />
        <StatCard
          title="Chiffre d'affaires"
          value={`${stats.revenue.toLocaleString()} GNF`}
          icon={DollarSign}
          trend={8}
          color="green"
        />
        <StatCard
          title="Produits en alerte"
          value={stats.lowStockProducts}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Suppliers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Package className="h-5 w-5 mr-2 text-blue-600" />
              Fournisseurs récents
            </h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Voir tout
            </button>
          </div>
          <div className="space-y-3">
            {recentData.suppliers.map((supplier) => (
              <div key={supplier.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{supplier.name}</p>
                  <p className="text-sm text-gray-600">{supplier.contactPerson} - {supplier.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{supplier.phone}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    supplier.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {supplier.status === 'active' ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
              Produits en alerte
            </h3>
            <button className="text-red-600 hover:text-red-700 text-sm font-medium">
              Voir tout
            </button>
          </div>
          <div className="space-y-3">
            {recentData.products.filter(p => p.status !== 'normal').map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">Stock: {product.stock} / Seuil: {product.threshold}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    product.status === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {product.status === 'critical' ? 'Critique' : 'Faible'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );



  // Quick Actions Component
  const renderQuickActions = () => <AdminQuickActions />;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="/images/LogoPharma.jpg" 
                alt="PharmaMOS Logo" 
                className="h-10 w-auto"
              />
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-xl font-semibold text-gray-900">Dashboard Admin</h1>
                <p className="text-sm text-gray-600">Gestion de PharmaMOS</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <AdminChatNotification />
              
              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              
              <div className="relative group">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 group-hover:scale-105"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-right transition-all duration-200">
                    <p className="text-sm font-medium text-gray-900">{user?.prenom} {user?.nom}</p>
                    <p className="text-xs text-gray-500 transition-all duration-200 group-hover:text-gray-700">Administrateur</p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                    showUserDropdown ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {showUserDropdown && (
                  <div className={`absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 transition-all duration-200 ${
                    user?.email && user.email.length > 25 ? 'w-80' : user?.email && user.email.length > 20 ? 'w-72' : 'w-64'
                  }`}>
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-green-200">
                          <User className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{user?.prenom} {user?.nom}</p>
                          <p className="text-sm text-gray-500 truncate hover:text-clip hover:whitespace-normal hover:break-all transition-all duration-200" title={user?.email}>{user?.email}</p>
                          <p className="text-xs text-green-600 font-medium">Administrateur</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center transition-colors duration-150">
                        <User className="h-4 w-4 mr-3 text-gray-400" />
                        Mon profil
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center transition-colors duration-150">
                        <Settings className="h-4 w-4 mr-3 text-gray-400" />
                        Paramètres
                      </button>
                      <hr className="my-2" />
                      <button 
                        onClick={() => {
                          logout();
                          navigate('/login');
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center transition-colors duration-150"
                      >
                        <LogOut className="h-4 w-4 mr-3 text-red-500" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-8 overflow-x-auto">
          <TabButton
            id="overview"
            label="Vue d'ensemble"
            icon={BarChart3}
            active={activeTab === 'overview'}
            onClick={setActiveTab}
          />
          <TabButton
            id="alerts"
            label="Alertes produits"
            icon={AlertTriangle}
            active={activeTab === 'alerts'}
            onClick={setActiveTab}
          />
          <TabButton
            id="reservations"
            label="Réservations"
            icon={Calendar}
            active={activeTab === 'reservations'}
            onClick={setActiveTab}
          />
          <TabButton
            id="clients"
            label="Clients"
            icon={Users}
            active={activeTab === 'clients'}
            onClick={setActiveTab}
          />
          <TabButton
            id="suppliers"
            label="Fournisseurs"
            icon={Package}
            active={activeTab === 'suppliers'}
            onClick={setActiveTab}
          />
          <TabButton
            id="invoices"
            label="Factures"
            icon={FileText}
            active={activeTab === 'invoices'}
            onClick={setActiveTab}
          />
          <TabButton
            id="cash-sale"
            label="Vente Espèces"
            icon={DollarSign}
            active={activeTab === 'cash-sale'}
            onClick={setActiveTab}
          />
          <TabButton
            id="daily-sales"
            label="Ventes du Jour"
            icon={TrendingUp}
            active={activeTab === 'daily-sales'}
            onClick={setActiveTab}
          />
          <TabButton
            id="products"
            label="Produits"
            icon={Package}
            active={activeTab === 'products'}
            onClick={setActiveTab}
          />
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <>
              {renderOverview()}
              {renderQuickActions()}
            </>
          )}
          {activeTab === 'alerts' && <AdminProductAlerts />}
          {activeTab === 'reservations' && <AdminReservationsManager />}
          {activeTab === 'clients' && <AdminClientsManager />}
          {activeTab === 'suppliers' && <AdminSuppliersManager />}
          {activeTab === 'invoices' && <AdminInvoicesManager />}
          {activeTab === 'cash-sale' && <AdminCashSale />}
          {activeTab === 'daily-sales' && <AdminDailySales />}
          {activeTab === 'products' && <AdminProductsManager />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
