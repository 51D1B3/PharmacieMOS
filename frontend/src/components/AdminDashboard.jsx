import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import apiService from '../services/api.jsx';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, Package, AlertTriangle, Calendar, 
  Users, FileText, DollarSign, Settings, LogOut, User,
  Bell, ChevronDown, TrendingUp, Clipboard, Shield,
  Activity, Download, UserPlus, CreditCard, MessageSquare,
  Clock, Database, PieChart, TrendingDown, Eye, ShoppingCart
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

import AdminProductAlerts from './AdminProductAlerts.jsx';
import AdminReservationsManager from './AdminReservationsManager.jsx';
import AdminClientsManager from './AdminClientsManager.jsx';
import AdminSuppliersManager from './AdminSuppliersManager.jsx';
import AdminInvoicesManager from './AdminInvoicesManager.jsx';
import AdminQuickActions from './AdminQuickActions.jsx';
import { API_BASE_URL } from '../config/api.js';
import AdminCashSale from './AdminCashSale.jsx';
import AdminDailySales from './AdminDailySales.jsx';
import AdminProductsManager from './AdminProductsManager.jsx';
import AdminPrescriptionManager from './AdminPrescriptionManager.jsx';
import AdminProductsGrid from './admin/AdminProductsGrid.jsx';
import PersonnelManager from './admin/PersonnelManager.jsx';

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
  const updatePrescriptionCount = () => {
    setPrescriptionCount(0);
  };
  
  // Connexion Socket.IO pour notifications temps réel
  useEffect(() => {
    updatePrescriptionCount();
  }, []);

  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const [showAddPharmacistModal, setShowAddPharmacistModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [pharmacistForm, setPharmacistForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    password: ''
  });

  const handleTabClick = (tabId) => {
    if (activeTab !== tabId) {
      setActiveTab(tabId);
      if (tabId === 'prescriptions') {
        setPrescriptionCount(0);
      }
    }
  };

  const handleQuickAction = (actionItem) => {
    if (actionItem.tab && activeTab !== actionItem.tab) {
      setActiveTab(actionItem.tab);
    } else if (actionItem.action) {
      switch (actionItem.action) {
        case 'download':
          downloadDailyReport();
          break;
        case 'alerts':
          setShowAllAlerts(true);
          break;
        case 'add-pharmacist':
          setShowAddPharmacistModal(true);
          break;
        case 'backup':
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
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Charger les produits depuis la base de données
      const productsResponse = await fetch(`${API_BASE_URL}/api/products`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData);
        
        // Calculer les statistiques basées sur les vraies données
        const lowStockCount = productsData.filter(p => 
          (p.stock?.onHand || 0) <= (p.stock?.thresholdAlert || 10)
        ).length;
        
        setStats({
          dailySales: 0,
          monthlySales: 0,
          totalRevenue: 0,
          totalProducts: productsData.length,
          totalUsers: 0,
          totalSuppliers: 0,
          lowStockProducts: lowStockCount,
          pendingOrders: 0,
          todayOrders: 0
        });

        setRecentData({
          orders: [],
          products: productsData,
          suppliers: [],
          users: []
        });
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
      // Fallback avec données par défaut
      setStats({
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
    } finally {
      setLoading(false);
    }
  };

  const handleAddPharmacist = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...pharmacistForm,
          role: 'pharmacien'
        })
      });
      
      if (response.ok) {
        alert('Pharmacien ajouté avec succès !');
        setShowAddPharmacistModal(false);
        setPharmacistForm({ nom: '', prenom: '', email: '', telephone: '', password: '' });
        // Recharger les données pour mettre à jour la liste du personnel
        loadDashboardData();
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message}`);
      }
    } catch (error) {
      console.error('Erreur ajout pharmacien:', error);
      alert('Erreur lors de l\'ajout du pharmacien');
    }
  };

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
    { name: 'Gestion Personnel', icon: UserPlus, color: 'blue', tab: 'personnel' },
    { name: 'Rapport Journalier', icon: Download, color: 'green', action: 'download' },
    { name: 'Logs Système', icon: Activity, color: 'orange', tab: 'activity-logs' },
    { name: 'Alertes Stock', icon: AlertTriangle, color: 'red', action: 'alerts' },
    { name: 'Ajouter Pharmacien', icon: UserPlus, color: 'cyan', action: 'add-pharmacist' },
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
              className={`p-4 rounded-lg bg-${action.color}-100 dark:bg-${action.color}-900/50 hover:bg-${action.color}-200 dark:hover:bg-${action.color}-800/50 transition-all duration-200 group border border-${action.color}-200 dark:border-${action.color}-700`}
            >
              <action.icon className={`h-6 w-6 text-${action.color}-600 dark:text-${action.color}-400 mx-auto mb-2 group-hover:scale-110 transition-transform`} />
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
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">PharmaMOS</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Gestion Complète de PharmaMOS</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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
            <TabButton id="personnel" label="Personnel" icon={Users} active={activeTab === 'personnel'} onClick={handleTabClick} />
            <TabButton id="suppliers" label="Fournisseurs" icon={Package} active={activeTab === 'suppliers'} onClick={handleTabClick} />
            <TabButton id="invoices" label="Factures" icon={FileText} active={activeTab === 'invoices'} onClick={handleTabClick} />
            <TabButton id="daily-sales" label="Ventes du Jour" icon={TrendingUp} active={activeTab === 'daily-sales'} onClick={handleTabClick} />
            <TabButton id="activity-logs" label="Logs Système" icon={Activity} active={activeTab === 'activity-logs'} onClick={handleTabClick} />
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="space-y-6">
          <div className={activeTab === 'overview' ? 'block' : 'hidden'}>
            {renderOverview()}
          </div>

          <div className={activeTab === 'personnel' ? 'block' : 'hidden'}>
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                    <Users className="h-6 w-6 mr-2 text-blue-600" />
                    Gestion du Personnel
                  </h3>
                </div>
                <PersonnelManager />
              </div>
            </div>
          </div>
          <div className={activeTab === 'suppliers' ? 'block' : 'hidden'}>
            <AdminSuppliersManager />
          </div>
          <div className={activeTab === 'invoices' ? 'block' : 'hidden'}>
            <AdminInvoicesManager />
          </div>

          <div className={activeTab === 'daily-sales' ? 'block' : 'hidden'}>
            <AdminDailySales />
          </div>
          <div className={activeTab === 'products' ? 'block' : 'hidden'}>
            <div className="space-y-6">
              <AdminProductsManager />
              <AdminProductsGrid />
            </div>
          </div>
          <div className={activeTab === 'activity-logs' ? 'block' : 'hidden'}>
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
          </div>

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
              {recentData.products.filter(p => (p.stock?.onHand || 0) <= (p.stock?.thresholdAlert || 10)).length > 0 ? (
                recentData.products.filter(p => (p.stock?.onHand || 0) <= (p.stock?.thresholdAlert || 10)).map(p => (
                  <div key={p._id || p.id} className="flex items-center space-x-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                    <img 
                      src={p.image || '/images/default_product.png'} 
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
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucun produit en alerte stock</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout de pharmacien */}
      {showAddPharmacistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full relative">
            <button 
              onClick={() => setShowAddPharmacistModal(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-300 dark:hover:text-gray-200 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
              <UserPlus className="h-6 w-6 mr-2 text-cyan-600" />
              Ajouter un Pharmacien
            </h2>
            <form onSubmit={handleAddPharmacist} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  required
                  value={pharmacistForm.nom}
                  onChange={(e) => setPharmacistForm({...pharmacistForm, nom: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Nom du pharmacien"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prénom
                </label>
                <input
                  type="text"
                  required
                  value={pharmacistForm.prenom}
                  onChange={(e) => setPharmacistForm({...pharmacistForm, prenom: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Prénom du pharmacien"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={pharmacistForm.email}
                  onChange={(e) => setPharmacistForm({...pharmacistForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="email@exemple.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  required
                  value={pharmacistForm.telephone}
                  onChange={(e) => setPharmacistForm({...pharmacistForm, telephone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="+224 XXX XXX XXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={pharmacistForm.password}
                  onChange={(e) => setPharmacistForm({...pharmacistForm, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Mot de passe sécurisé"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddPharmacistModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center justify-center"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;