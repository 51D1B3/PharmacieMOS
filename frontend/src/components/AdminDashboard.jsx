import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import apiService from '../services/api.jsx';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, Package, AlertTriangle, Calendar, 
  Users, FileText, DollarSign, Settings, LogOut, User,
  Bell, ChevronDown, TrendingUp, Clipboard, Shield,
  Activity, Download, UserPlus, CreditCard, MessageSquare,
  Clock, Database, PieChart, TrendingDown, Eye
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
import AdminPrescriptionManager from './AdminPrescriptionManager.jsx';
import AdminProductsGrid from './admin/AdminProductsGrid.jsx';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [stats, setStats] = useState({
    dailySales: 0,
    monthlySales: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalSuppliers: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
    todayOrders: 0
  });
  const [recentData, setRecentData] = useState({
    orders: [],
    products: [],
    suppliers: [],
    users: []
  });
  const [notifications, setNotifications] = useState([]);
  const [prescriptionCount, setPrescriptionCount] = useState(0);
  const [socket, setSocket] = useState(null);
  
  // Fonction pour mettre à jour le badge des prescriptions
  const updatePrescriptionCount = async () => {
    try {
      const response = await fetch('http://localhost:5005/api/prescriptions/all');
      const data = await response.json();
      const pendingCount = data?.data?.prescriptions?.filter(p => p.status === 'pending')?.length || 0;
      setPrescriptionCount(pendingCount);
    } catch (error) {
      setPrescriptionCount(0);
    }
  };
  
  // Connexion Socket.IO pour notifications temps réel
  useEffect(() => {
    const newSocket = io('http://localhost:5005');
    setSocket(newSocket);
    
    // Rejoindre la room admin
    newSocket.emit('join-room', { userId: 'admin', role: 'admin' });
    
    // Écouter les nouvelles prescriptions
    newSocket.on('new-prescription', (data) => {
      console.log('🔔 Nouvelle prescription reçue:', data);
      updatePrescriptionCount();
    });
    
    updatePrescriptionCount();
    
    return () => newSocket.close();
  }, []);

  const [showAllAlerts, setShowAllAlerts] = useState(false);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'prescriptions') {
      setPrescriptionCount(0);
    }
  };

  const handleQuickAction = (actionItem) => {
    if (actionItem.tab) {
      setActiveTab(actionItem.tab);
    } else if (actionItem.action) {
      switch (actionItem.action) {
        case 'download':
          downloadDailyReport();
          break;
        case 'alerts':
          setShowAllAlerts(true);
          break;
        case 'chat':
          // Ouvrir la messagerie
          alert('Ouverture de la messagerie...');
          break;
        case 'backup':
          // Déclencher une sauvegarde
          alert('Sauvegarde du système démarrée...');
          break;
        default:
          alert(`Action : ${actionItem.name}`);
      }
    }
  };

  // Fonction pour télécharger le rapport Excel
  const downloadDailyReport = () => {
    // Simuler le téléchargement d'un rapport Excel
    const today = new Date().toISOString().split('T')[0];
    const filename = `rapport-ventes-${today}.xlsx`;
    
    // Créer un lien de téléchargement fictif
    const link = document.createElement('a');
    link.href = '#';
    link.download = filename;
    link.click();
    
    alert(`Téléchargement du rapport ${filename} démarré`);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Récupérer toutes les données
        const [orders, products, suppliers, users] = await Promise.all([
          apiService.getOrders().catch(() => ({ data: [] })),
          apiService.getProducts().catch(() => ({ data: [] })),
          apiService.getSuppliers().catch(() => ({ data: [] })),
          fetch('http://localhost:5005/api/admin/users', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
          }).then(res => res.json()).catch(() => ({ data: [] }))
        ]);
        
        // Calculer les statistiques
        const today = new Date();
        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        const dailySales = orders.reduce((sum, order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate.toDateString() === today.toDateString() ? sum + (order.totalTTC || order.total || 0) : sum;
        }, 0);

        const monthlySales = orders.reduce((sum, order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= thisMonth ? sum + (order.totalTTC || order.total || 0) : sum;
        }, 0);

        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalTTC || order.total || 0), 0);
        
        const productsArray = Array.isArray(products) ? products : (products?.data || []);
        const usersArray = Array.isArray(users.data) ? users.data : [];
        const suppliersArray = Array.isArray(suppliers) ? suppliers : (suppliers?.data || []);
        
        const lowStockProducts = productsArray.filter(p => (p.stock?.onHand || 0) <= (p.stock?.thresholdAlert || 10));
        const todayOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate.toDateString() === today.toDateString();
        });

        setStats({
          dailySales,
          monthlySales,
          totalRevenue,
          totalProducts: productsArray.length,
          totalUsers: usersArray.length,
          totalSuppliers: suppliersArray.length,
          lowStockProducts: lowStockProducts.length,
          pendingOrders: orders.filter(o => o.status === 'pending').length,
          todayOrders: todayOrders.length
        });

        setRecentData({
          orders: Array.isArray(orders) ? orders : (orders?.data || []),
          products: productsArray,
          suppliers: suppliersArray,
          users: usersArray
        });
      } catch (e) {
        console.error('Erreur chargement dashboard:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Composant pour les cartes de statistiques
  const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`bg-${color}-100 dark:bg-${color}-900/50 p-3 rounded-full`}>
            <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
            {trend && (
              <div className={`flex items-center mt-1 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trend === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Composant pour les boutons d'onglet
  const TabButton = ({ id, label, icon: Icon, active, onClick, badge }) => (
    <button
      onClick={() => onClick(id)}
      className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
        active
          ? 'bg-green-600 text-white shadow'
          : 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
          {badge}
        </span>
      )}
    </button>
  );

  // Actions rapides pour l'admin
  const adminQuickActions = [
    { name: 'Ajouter Utilisateur', icon: UserPlus, color: 'blue', tab: 'users' },
    { name: 'Rapport Journalier', icon: Download, color: 'green', action: 'download' },
    { name: 'Gestion Rôles', icon: Shield, color: 'purple', tab: 'roles' },
    { name: 'Logs Système', icon: Activity, color: 'orange', tab: 'activity-logs' },
    { name: 'Vente Directe', icon: CreditCard, color: 'indigo', tab: 'cash-sale' },
    { name: 'Alertes Stock', icon: AlertTriangle, color: 'red', action: 'alerts' },
    { name: 'Messagerie', icon: MessageSquare, color: 'cyan', action: 'chat' },
    { name: 'Sauvegarde', icon: Database, color: 'gray', action: 'backup' }
  ];

  // Vue d'ensemble du tableau de bord
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Actions rapides Admin */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2 text-green-600" />
          Actions Rapides Admin
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {adminQuickActions.map((action) => (
            <button
              key={action.name}
              onClick={() => handleQuickAction(action)}
              className={`p-4 rounded-lg border-2 border-dashed border-${action.color}-300 hover:border-${action.color}-500 hover:bg-${action.color}-50 dark:hover:bg-${action.color}-900/20 transition-all duration-200 group`}
            >
              <action.icon className={`h-6 w-6 text-${action.color}-600 mx-auto mb-2 group-hover:scale-110 transition-transform`} />
              <p className={`text-xs font-medium text-${action.color}-700 dark:text-${action.color}-300 text-center`}>{action.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Ventes du jour" 
          value={`${stats.dailySales.toLocaleString()} GNF`} 
          icon={BarChart3} 
          color="green"
          trend="up"
          trendValue="+12%"
        />
        <StatCard 
          title="Ventes du mois" 
          value={`${stats.monthlySales.toLocaleString()} GNF`} 
          icon={TrendingUp} 
          color="blue"
          trend="up"
          trendValue="+8%"
        />
        <StatCard 
          title="Chiffre d'affaires total" 
          value={`${stats.totalRevenue.toLocaleString()} GNF`} 
          icon={DollarSign} 
          color="purple"
        />
        <StatCard 
          title="Commandes aujourd'hui" 
          value={stats.todayOrders} 
          icon={ShoppingCart} 
          color="orange"
        />
      </div>

      {/* Statistiques secondaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Produits" value={stats.totalProducts} icon={Package} color="indigo" />
        <StatCard title="Total Utilisateurs" value={stats.totalUsers} icon={Users} color="pink" />
        <StatCard title="Total Fournisseurs" value={stats.totalSuppliers} icon={FileText} color="cyan" />
        <StatCard title="Produits en alerte" value={stats.lowStockProducts} icon={AlertTriangle} color="red" />
      </div>

      {/* Graphiques et données récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activité récente */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-600" />
              Activité Récente
            </h3>
            <button 
              onClick={() => setActiveTab('activity-logs')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Voir tout
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Nouvelle vente enregistrée</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Il y a 5 minutes</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Stock faible détecté</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Il y a 15 minutes</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Nouvel utilisateur créé</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Il y a 1 heure</p>
              </div>
            </div>
          </div>
        </div>

        {/* Produits en alerte */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
              Alertes Stock
            </h3>
            <button 
              className="text-red-600 hover:text-red-700 text-sm font-medium" 
              onClick={() => setShowAllAlerts(true)}
            >
              Voir tout
            </button>
          </div>
          <div className="space-y-3">
            {recentData.products.filter(p => (p.stock?.onHand || 0) <= (p.stock?.thresholdAlert || 10)).slice(0, 4).map((p) => (
              <div key={p._id || p.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{p.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Stock: {p.stock?.onHand ?? 0}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">Alerte</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statistiques financières détaillées */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
          <PieChart className="h-5 w-5 mr-2 text-green-600" />
          Analyse Financière
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">Bénéfices du Mois</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{(stats.monthlySales * 0.3).toLocaleString()} GNF</p>
                <p className="text-xs text-green-600 dark:text-green-400">Marge: 30%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Commandes en Attente</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.pendingOrders}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Nécessite attention</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Croissance</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">+12%</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">vs mois dernier</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Rapport de téléchargement */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Rapports et Exports</h3>
            <p className="text-green-100">Téléchargez les rapports détaillés au format Excel</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={downloadDailyReport}
              className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Ventes du Jour</span>
            </button>
            <button
              onClick={() => alert('Téléchargement du rapport mensuel...')}
              className="bg-white/20 text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/30 transition-colors flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>Rapport Mensuel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img src="/images/mon_logo.png" alt="Logo" className="h-12 w-12 rounded-full object-cover" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Dashboard Admin</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Gestion Complète de PharmaMOS</p>
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
              <div className="relative">
                <button 
                  onClick={() => setShowUserDropdown(!showUserDropdown)} 
                  className="flex items-center space-x-2"
                >
                  <img 
                    className="h-8 w-8 rounded-full" 
                    src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.nom}&background=dcfce7&color=16a34a`} 
                    alt="Profil" 
                  />
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border dark:border-gray-700">
                    <div className="p-2">
                      <div className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">
                        <p className="font-medium">{user?.nom} {user?.prenom}</p>
                        <p className="text-xs text-gray-500">Administrateur</p>
                      </div>
                      <button 
                        onClick={() => { logout(); navigate('/login'); }} 
                        className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-md flex items-center mt-2"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
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
        {/* Navigation par onglets */}
        <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-4 overflow-x-auto">
            <TabButton id="overview" label="Vue d'ensemble" icon={BarChart3} active={activeTab === 'overview'} onClick={handleTabClick} />
            <TabButton id="products" label="Produits" icon={Package} active={activeTab === 'products'} onClick={handleTabClick} />
            <TabButton 
              id="prescriptions" 
              label="Ordonnances" 
              icon={Clipboard} 
              active={activeTab === 'prescriptions'} 
              onClick={() => handleTabClick('prescriptions')}
              badge={prescriptionCount}
            />
            <TabButton id="users" label="Utilisateurs" icon={Users} active={activeTab === 'users'} onClick={handleTabClick} />
            <TabButton id="suppliers" label="Fournisseurs" icon={Package} active={activeTab === 'suppliers'} onClick={handleTabClick} />
            <TabButton id="invoices" label="Factures" icon={FileText} active={activeTab === 'invoices'} onClick={handleTabClick} />
            <TabButton id="cash-sale" label="Vente Directe" icon={DollarSign} active={activeTab === 'cash-sale'} onClick={handleTabClick} />
            <TabButton id="daily-sales" label="Ventes du Jour" icon={TrendingUp} active={activeTab === 'daily-sales'} onClick={handleTabClick} />
            <TabButton id="activity-logs" label="Logs Système" icon={Activity} active={activeTab === 'activity-logs'} onClick={handleTabClick} />
            <TabButton id="roles" label="Rôles" icon={Shield} active={activeTab === 'roles'} onClick={handleTabClick} />
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="space-y-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'prescriptions' && <AdminPrescriptionManager />}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                    <Users className="h-6 w-6 mr-2 text-blue-600" />
                    Gestion des Utilisateurs et Rôles
                  </h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Utilisateurs</h4>
                    <AdminClientsManager />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Rôles et Permissions</h4>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Gérez les rôles et permissions des utilisateurs</p>
                      <button 
                        onClick={() => setActiveTab('roles')}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                      >
                        <Shield className="h-4 w-4" />
                        <span>Gérer les Rôles</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'suppliers' && <AdminSuppliersManager />}
          {activeTab === 'invoices' && <AdminInvoicesManager />}
          {activeTab === 'cash-sale' && <AdminCashSale />}
          {activeTab === 'daily-sales' && <AdminDailySales />}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <AdminProductsManager />
              <AdminProductsGrid />
            </div>
          )}
          {activeTab === 'activity-logs' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Activity className="h-6 w-6 mr-2 text-green-600" />
                Journaux d'Activité Système
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Fonctionnalité en cours de développement...</p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'roles' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <Shield className="h-6 w-6 mr-2 text-purple-600" />
                  Gestion des Rôles et Permissions
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Composant de gestion des rôles en cours d'intégration...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal pour toutes les alertes */}
      {showAllAlerts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-2xl w-full relative">
            <button 
              onClick={() => setShowAllAlerts(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-300 dark:hover:text-gray-200 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Tous les Produits en Alerte</h2>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {recentData.products.filter(p => (p.stock?.onHand || 0) <= (p.stock?.thresholdAlert || 10)).map(p => (
                <div key={p._id || p.id} className="flex items-center space-x-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                  <img 
                    src={p.images?.[0] || '/images/default_product.png'} 
                    alt={p.name} 
                    className="h-12 w-12 object-cover rounded" 
                  />
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-gray-100 font-semibold">{p.name}</p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Stock: {p.stock?.onHand ?? 0}</p>
                  </div>
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    Alerte
                  </span>
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