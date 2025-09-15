import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, Package, ClipboardCheck, ShoppingCart, Users, 
  Bell, MessageCircle, User as UserIcon, LogOut, AlertCircle,
  FileText, PlusCircle, Clock, CheckCircle2, XCircle
} from 'lucide-react';

// Import components
import PrescriptionManager from './PrescriptionManager';
import SalesManager from './SalesManager';
import CustomerHistory from './CustomerHistory';
import StockManager from './StockManager';

const PharmacistDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [pendingPrescriptions, setPendingPrescriptions] = useState(0);
  const [lowStockItems, setLowStockItems] = useState(0);

  // Navigation items
  const navigation = [
    { name: 'Tableau de bord', icon: Home, tab: 'dashboard' },
    { 
      name: 'Ordonnances', 
      icon: ClipboardCheck, 
      tab: 'prescriptions',
      badge: pendingPrescriptions > 0 ? pendingPrescriptions : null
    },
    { 
      name: 'Ventes', 
      icon: ShoppingCart, 
      tab: 'sales' 
    },
    { 
      name: 'Stock', 
      icon: Package, 
      tab: 'stock',
      badge: lowStockItems > 0 ? lowStockItems : null
    },
    { 
      name: 'Clients', 
      icon: Users, 
      tab: 'customers' 
    },
  ];

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch pending prescriptions count
        // const prescRes = await api.get('/api/prescriptions/pending/count');
        // setPendingPrescriptions(prescRes.data.count);
        
        // Fetch low stock items
        // const stockRes = await api.get('/api/products/low-stock/count');
        // setLowStockItems(stockRes.data.count);
        
        // Mock data for now
        setPendingPrescriptions(3);
        setLowStockItems(5);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Handle WhatsApp contact
  const handleContactAdmin = () => {
    const phoneNumber = '224623841149';
    const message = encodeURIComponent("Bonjour Admin, j'ai besoin d'assistance concernant : ");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  // Render main content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tableau de bord</h2>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                    <ClipboardCheck className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ordonnances en attente</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {pendingPrescriptions}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400">
                    <Package className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Produits en alerte de stock</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {lowStockItems}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400">
                    <ShoppingCart className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ventes aujourd'hui</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">12</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Activité récente</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Nouvelle ordonnance reçue de Jean Dupont
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Il y a {item * 2} heures
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'prescriptions':
        return <PrescriptionManager />;
        
      case 'sales':
        return <SalesManager />;
        
      case 'stock':
        return <StockManager />;
        
      case 'customers':
        return <CustomerHistory />;
        
      default:
        return <div>Page non trouvée</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img
                  className="h-8 w-auto"
                  src="/images/logo.png"
                  alt="Logo PharmaMOS"
                />
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                  PharmaMOS
                </span>
              </div>
              <nav className="hidden md:ml-10 md:flex md:space-x-8">
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => setActiveTab(item.tab)}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      activeTab === item.tab
                        ? 'border-green-500 text-gray-900 dark:text-white'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    {item.name}
                    {item.badge && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
            <div className="flex items-center">
              {/* WhatsApp Contact Button */}
              <button
                onClick={handleContactAdmin}
                className="p-1 rounded-full text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 mr-4"
                title="Contacter l'admin"
              >
                <MessageCircle className="h-6 w-6" />
              </button>
              
              {/* Notifications */}
              <div className="ml-4 relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                >
                  <span className="sr-only">Voir les notifications</span>
                  <Bell className="h-6 w-6" />
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Notifications</h3>
                      </div>
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div key={notification.id} className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <p className="text-sm text-gray-700 dark:text-gray-200">{notification.message}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{notification.time}</p>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Aucune notification</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* User Menu */}
              <div className="ml-4 relative">
                <div>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center max-w-xs rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    id="user-menu"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Ouvrir le menu utilisateur</span>
                    <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-300" />
                    </div>
                  </button>
                </div>
                
                {showUserMenu && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <div className="py-1" role="none">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-700 dark:text-gray-200">
                          {user?.name || 'Utilisateur'}
                        </p>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                          {user?.email || 'pharmacien@pharmamos.com'}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        role="menuitem"
                      >
                        <div className="flex items-center">
                          <LogOut className="h-4 w-4 mr-2" />
                          Déconnexion
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile navigation */}
        <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-around px-2 py-2">
            {navigation.slice(0, 5).map((item) => (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                className={`flex flex-col items-center px-2 py-2 text-xs font-medium rounded-md ${
                  activeTab === item.tab
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <item.icon className="h-6 w-6" />
                <span className="mt-1">{item.name}</span>
                {item.badge && (
                  <span className="absolute top-0 right-0 -mt-1 -mr-1 inline-flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-white text-2xs">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default PharmacistDashboard;
