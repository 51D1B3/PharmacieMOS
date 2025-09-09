import React, { useState, useEffect } from 'react';
import apiService from '../services/api.jsx';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, Package, AlertTriangle, Calendar, 
  Users, FileText,
  DollarSign, Settings, LogOut, User,
  Bell, ChevronDown, TrendingUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
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
    revenue: 0,
    lowStockProducts: 0
  });
  const [recentData, setRecentData] = useState({
    orders: [],
    products: [],
    suppliers: []
  });
  const [notifications, setNotifications] = useState([]);

  const [showAllAlerts, setShowAllAlerts] = useState(false);

  const handleQuickAction = (action) => {
    switch (action) {
      case 'POS':
        setActiveTab('cash-sale');
        break;
      case 'Ajouter Fournisseur':
        setActiveTab('suppliers');
        break;
      case 'Ajouter Client':
        setActiveTab('clients');
        break;
      default:
        alert(`Action rapide : ${action}`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Récupérer toutes les commandes et produits
        const [orders, products, suppliers] = await Promise.all([
          apiService.getOrders(),
          apiService.getProducts(),
          apiService.getSuppliers()
        ]);
        // Ventes du jour
        const today = new Date();
        const dailySales = orders.reduce((sum, order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate.toDateString() === today.toDateString() ? sum + (order.totalTTC || order.total || 0) : sum;
        }, 0);
        // Chiffre d'affaires
        const revenue = orders.reduce((sum, order) => sum + (order.totalTTC || order.total || 0), 0);
        // Produits en alerte (stock <= seuil)
        const lowStockProducts = products.filter(p => (p.stock?.onHand || 0) <= (p.stock?.thresholdAlert || 10));
        setStats({
          dailySales,
          revenue,
          lowStockProducts: lowStockProducts.length
        });
        setRecentData({
          orders,
          products,
          suppliers
        });
      } catch (e) {
        console.error('Erreur chargement dashboard:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Composant interne pour les cartes de statistiques
  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center space-x-4">
      <div className={`bg-${color}-100 dark:bg-${color}-900/50 p-3 rounded-full`}>
        <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
      </div>
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
      </div>
    </div>
  );

  // Composant interne pour les boutons d'onglet
  const TabButton = ({ id, label, icon: Icon, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
        active
          ? 'bg-green-600 text-white shadow'
          : 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </button>
  );

  // Fonction de rendu pour la vue d'ensemble
  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Ventes du jour" value={`${stats.dailySales.toLocaleString()} GNF`} icon={BarChart3} color="green" />
        <StatCard title="Chiffre d'affaires" value={`${stats.revenue.toLocaleString()} GNF`} icon={DollarSign} color="blue" />
        <StatCard title="Produits en alerte" value={stats.lowStockProducts} icon={AlertTriangle} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center"><Package className="h-5 w-5 mr-2 text-blue-600" />Fournisseurs récents</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Voir tout</button>
          </div>
          <div className="space-y-3">
            {recentData.suppliers.slice(0, 5).map((s) => (
              <div key={s._id || s.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div><p className="font-medium text-gray-900 dark:text-gray-100">{s.name}</p><p className="text-sm text-gray-600 dark:text-gray-400">{s.contactPerson || s.email}</p></div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Actif</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center"><AlertTriangle className="h-5 w-5 mr-2 text-red-600" />Produits en alerte</h3>
            <button className="text-red-600 hover:text-red-700 text-sm font-medium" onClick={() => setShowAllAlerts(true)}>Voir tout</button>
          </div>
          <div className="space-y-3">
            {recentData.products.filter(p => (p.stock?.onHand || 0) <= (p.stock?.thresholdAlert || 10)).slice(0, 5).map((p) => (
              <div key={p._id || p.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div><p className="font-medium text-gray-900 dark:text-gray-100">{p.name}</p><p className="text-sm text-gray-600 dark:text-gray-400">Stock: {p.stock?.onHand ?? 0}</p></div>
                <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">Alerte</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img src="/images/mon_logo.png" alt="Logo" className="h-12 w-12 rounded-full object-cover" />
              <div><h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Dashboard Admin</h1><p className="text-sm text-gray-600 dark:text-gray-300">Gestion de PharmaMOS</p></div>
            </div>
            <div className="flex items-center space-x-4">
              <AdminChatNotification />
              <button className="relative p-2 text-gray-400 hover:text-gray-500"><Bell className="h-6 w-6" /></button>
              <div className="relative">
                <button onClick={() => setShowUserDropdown(!showUserDropdown)} className="flex items-center space-x-2"><img className="h-8 w-8 rounded-full" src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.nom}&background=dcfce7&color=16a34a`} alt="Profil" /><ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} /></button>
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border dark:border-gray-700">
                    <div className="p-2"><button onClick={() => { logout(); navigate('/login'); }} className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-md flex items-center"><LogOut className="h-4 w-4 mr-2" />Déconnexion</button></div>
                  </div>
                )}
              </div>
            </div>
        </div></div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 border-b border-gray-200 dark:border-gray-700"><nav className="-mb-px flex space-x-4 overflow-x-auto">
            <TabButton id="overview" label="Vue d'ensemble" icon={BarChart3} active={activeTab === 'overview'} onClick={setActiveTab} />
            <TabButton id="products" label="Produits" icon={Package} active={activeTab === 'products'} onClick={setActiveTab} />
            <TabButton id="alerts" label="Alertes" icon={AlertTriangle} active={activeTab === 'alerts'} onClick={setActiveTab} />
            <TabButton id="clients" label="Clients" icon={Users} active={activeTab === 'clients'} onClick={setActiveTab} />
            <TabButton id="suppliers" label="Fournisseurs" icon={Package} active={activeTab === 'suppliers'} onClick={setActiveTab} />
            <TabButton id="invoices" label="Factures" icon={FileText} active={activeTab === 'invoices'} onClick={setActiveTab} />
            <TabButton id="cash-sale" label="Vente Directe" icon={DollarSign} active={activeTab === 'cash-sale'} onClick={setActiveTab} />
            <TabButton id="daily-sales" label="Ventes du Jour" icon={TrendingUp} active={activeTab === 'daily-sales'} onClick={setActiveTab} />
        </nav></div>

        <div className="space-y-6">
          {activeTab === 'overview' && (
            <>
              <AdminQuickActions onAction={handleQuickAction} />
              {renderOverview()}
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

      {showAllAlerts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gray-900 rounded-xl shadow-2xl p-8 max-w-2xl w-full relative">
            <button onClick={() => setShowAllAlerts(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-200">&times;</button>
            <h2 className="text-2xl font-bold text-white mb-6">Produits en alerte</h2>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {recentData.products.filter(p => (p.stock?.onHand || 0) <= (p.stock?.thresholdAlert || 10)).map(p => (
                <div key={p._id || p.id} className="flex items-center space-x-4 bg-gray-800 rounded-lg p-4">
                  <img src={p.images?.[0] || '/images/default_product.png'} alt={p.name} className="h-12 w-12 object-cover rounded" />
                  <div className="flex-1">
                    <p className="text-white font-semibold">{p.name}</p>
                    <p className="text-gray-300 text-sm">Stock: {p.stock?.onHand ?? 0}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;