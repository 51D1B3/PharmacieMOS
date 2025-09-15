import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { 
  Pill, FileText, ShoppingCart, MessageSquare, Bell, 
  LogOut, User, ChevronDown, Clock, CheckCircle, 
  XCircle, AlertTriangle, Package, Receipt, History,
  Phone, Eye, Edit, Send, Download
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { API_BASE_URL, SOCKET_URL } from '../config/api.js';

import PharmacistPrescriptions from './pharmacist/PharmacistPrescriptions.jsx';
import PharmacistSales from './pharmacist/PharmacistSales.jsx';
import PharmacistStock from './pharmacist/PharmacistStock.jsx';
import PharmacistHistory from './pharmacist/PharmacistHistory.jsx';
import PharmacistChat from './pharmacist/PharmacistChat.jsx';
import PharmacistProductsGrid from './pharmacist/PharmacistProductsGrid.jsx';

const PharmacistDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [stats, setStats] = useState({
    pendingPrescriptions: 0,
    todaySales: 0,
    todayRevenue: 0,
    lowStockAlerts: 0,
    processedPrescriptions: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [socket, setSocket] = useState(null);

  // Connexion Socket.IO pour notifications temps réel
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    
    newSocket.emit('join-room', { userId: user?.id, role: 'pharmacien' });
    
    newSocket.on('new-prescription', (data) => {
      console.log('🔔 Nouvelle ordonnance reçue:', data);
      loadStats();
    });
    
    newSocket.on('new-message', (message) => {
      if (message.sender?.role !== 'pharmacien') {
        setUnreadMessages(prev => prev + 1);
      }
    });
    
    return () => newSocket.close();
  }, [user]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Récupérer les statistiques réelles
      const statsResponse = await fetch(`${API_BASE_URL}/api/pharmacist/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
      
      // Récupérer les notifications (ordonnances + ventes récentes)
      const [prescriptionsResponse, salesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/pharmacist/recent-prescriptions`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`${API_BASE_URL}/api/pharmacist/recent-sales`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);
      
      const notifications = [];
      
      if (prescriptionsResponse.ok) {
        const prescriptions = await prescriptionsResponse.json();
        setRecentPrescriptions(prescriptions);
        prescriptions.forEach(p => {
          notifications.push({
            id: `prescription-${p.id}`,
            type: 'prescription',
            message: `Nouvelle ordonnance de ${p.patient}`,
            time: p.time,
            read: p.status !== 'pending'
          });
        });
      }
      
      if (salesResponse.ok) {
        const sales = await salesResponse.json();
        setRecentSales(sales);
        sales.slice(0, 2).forEach(s => {
          notifications.push({
            id: `sale-${s.id}`,
            type: 'sale',
            message: `Vente terminée - ${s.client}`,
            time: s.time,
            read: true
          });
        });
      }
      
      setNotifications(notifications);
      
    } catch (error) {
      console.error('Erreur chargement stats:', error);
      // Fallback avec données par défaut en cas d'erreur
      setStats({
        pendingPrescriptions: 0,
        todaySales: 0,
        todayRevenue: 0,
        lowStockAlerts: 0,
        processedPrescriptions: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppContact = () => {
    const adminPhone = '+224623841149';
    const message = encodeURIComponent(`Bonjour Admin, je suis ${user?.prenom} ${user?.nom}, pharmacien. J'ai besoin de votre assistance.`);
    const whatsappUrl = `https://wa.me/${adminPhone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const StatCard = ({ title, value, icon: Icon, color, onClick }) => (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-all cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
        <div className={`bg-${color}-100 dark:bg-${color}-900/50 p-3 rounded-full`}>
          <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
    </div>
  );

  const TabButton = ({ id, label, icon: Icon, active, onClick, badge }) => (
    <button
      onClick={() => onClick(id)}
      className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
        active
          ? 'bg-blue-600 text-white shadow'
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

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Actions rapides pharmacien */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <Pill className="h-5 w-5 mr-2 text-blue-600" />
          Actions Rapides
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveTab('prescriptions')}
            className="p-4 rounded-lg border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
          >
            <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Ordonnances</p>
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className="p-4 rounded-lg border-2 border-dashed border-green-300 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 group"
          >
            <ShoppingCart className="h-8 w-8 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-green-700 dark:text-green-300">Nouvelle Vente</p>
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className="p-4 rounded-lg border-2 border-dashed border-orange-300 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 group"
          >
            <Package className="h-8 w-8 text-orange-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Vérifier Stock</p>
          </button>
          <button
            onClick={handleWhatsAppContact}
            className="p-4 rounded-lg border-2 border-dashed border-purple-300 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 group"
          >
            <Phone className="h-8 w-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Contacter Admin</p>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Ordonnances en attente" 
          value={stats.pendingPrescriptions} 
          icon={FileText} 
          color="red"
          onClick={() => setActiveTab('prescriptions')}
        />
        <StatCard 
          title="Ventes aujourd'hui" 
          value={stats.todaySales} 
          icon={ShoppingCart} 
          color="green"
          onClick={() => setActiveTab('sales')}
        />
        <StatCard 
          title="Revenus du jour" 
          value={`${stats.todayRevenue.toLocaleString()} GNF`} 
          icon={Receipt} 
          color="blue"
        />
        <StatCard 
          title="Alertes stock" 
          value={stats.lowStockAlerts} 
          icon={AlertTriangle} 
          color="orange"
          onClick={() => setActiveTab('stock')}
        />
      </div>

      {/* Activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Ordonnances Récentes
            </h3>
            <button 
              onClick={() => setActiveTab('prescriptions')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Voir tout
            </button>
          </div>
          <div className="space-y-3">
            {recentPrescriptions.length > 0 ? recentPrescriptions.map((prescription, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{prescription.patient}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Il y a {prescription.time}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  prescription.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {prescription.status === 'pending' ? 'En attente' : 'Validée'}
                </span>
              </div>
            )) : (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                <p>Aucune ordonnance récente</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <History className="h-5 w-5 mr-2 text-green-600" />
              Ventes du Jour
            </h3>
            <button 
              onClick={() => setActiveTab('history')}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              Historique
            </button>
          </div>
          <div className="space-y-3">
            {recentSales.length > 0 ? recentSales.map((sale, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{sale.client}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Il y a {sale.time}</p>
                </div>
                <span className="font-semibold text-green-600">{sale.amount.toLocaleString()} GNF</span>
              </div>
            )) : (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                <p>Aucune vente aujourd'hui</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Admin WhatsApp */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Besoin d'aide ?</h3>
            <p className="text-green-100">Contactez l'administrateur directement via WhatsApp</p>
          </div>
          <button
            onClick={handleWhatsAppContact}
            className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2"
          >
            <Phone className="h-5 w-5" />
            <span>WhatsApp Admin</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Dashboard Pharmacien</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Gestion des Ordonnances et Ventes</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
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
                    src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.nom}&background=3b82f6&color=ffffff`} 
                    alt="Profil" 
                  />
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border dark:border-gray-700">
                    <div className="p-2">
                      <div className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">
                        <p className="font-medium">{user?.prenom} {user?.nom}</p>
                        <p className="text-xs text-gray-500">Pharmacien</p>
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
            <TabButton id="overview" label="Vue d'ensemble" icon={Pill} active={activeTab === 'overview'} onClick={setActiveTab} />
            <TabButton 
              id="prescriptions" 
              label="Ordonnances" 
              icon={FileText} 
              active={activeTab === 'prescriptions'} 
              onClick={setActiveTab}
              badge={stats.pendingPrescriptions}
            />
            <TabButton id="sales" label="Ventes" icon={ShoppingCart} active={activeTab === 'sales'} onClick={setActiveTab} />
            <TabButton id="stock" label="Stock" icon={Package} active={activeTab === 'stock'} onClick={setActiveTab} />
            <TabButton id="history" label="Historique" icon={History} active={activeTab === 'history'} onClick={setActiveTab} />
            <TabButton id="chat" label="Messages" icon={MessageSquare} active={activeTab === 'chat'} onClick={(tab) => { setActiveTab(tab); if (tab === 'chat') setUnreadMessages(0); }} badge={unreadMessages} />
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="space-y-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'prescriptions' && <PharmacistPrescriptions />}
          {activeTab === 'sales' && <PharmacistSales />}
          {activeTab === 'stock' && (
            <div className="space-y-6">
              <PharmacistStock />
              <PharmacistProductsGrid />
            </div>
          )}
          {activeTab === 'history' && <PharmacistHistory />}
          {activeTab === 'chat' && <PharmacistChat />}
        </div>
      </main>
    </div>
  );
};

export default PharmacistDashboard;