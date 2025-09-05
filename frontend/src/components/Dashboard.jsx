import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Bell, Calendar, Phone, Info, Heart, Home, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useCart } from '../contexts/CartContext.jsx';
import apiService from '../services/api.jsx';
import CartDrawer from './CartDrawer.jsx';
import ClientChatWidget from './ClientChatWidget.jsx';
import HeroSection from './HeroSection.jsx';
import UserProfile from './UserProfile.jsx';

import QuickCart from './QuickCart.jsx';
import PharmacyWelcomeSection from './PharmacyWelcomeSection.jsx';
import HealthTipsModal from './HealthTipsModal.jsx';
import PharmacyContactModal from './PharmacyContactModal.jsx';
import ServicesModal from './ServicesModal.jsx';
import UserDropdowns from './UserDropdowns.jsx';
import PrescriptionUpload from './PrescriptionUpload.jsx';
import PaymentModal from './PaymentModal.jsx';
import PharmacyInfoModal from './PharmacyInfoModal.jsx';
import PriceDisplayDemo from './PriceDisplayDemo.jsx';
import ProductsGrid from './ProductsGrid.jsx';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { cartItems, removeFromCart, updateCartQuantity, getCartItemsCount, clearCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showHealthTips, setShowHealthTips] = useState(false);
  const [showPharmacyContact, setShowPharmacyContact] = useState(false);
  const [chatPredefinedMessage, setChatPredefinedMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  // Fonction centralisée pour l'action rendez-vous
  const handleAppointmentClick = () => {
    const appointmentMessage = "Salut le pharmacien ! Je voudrais vous consulter . Quels sont vos disponibilités ?";
    setChatPredefinedMessage(appointmentMessage);
    setShowChat(true);
  };
  const [showServices, setShowServices] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showPharmacyInfo, setShowPharmacyInfo] = useState(false);
  const [activeTab, setActiveTab] = useState('accueil');
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.product.priceTTC * item.quantity), 0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      // Charger seulement les notifications personnalisées depuis l'admin
      const response = await apiService.getNotifications();
      const adminNotifications = (response || []).filter(notification => 
        notification.isPersonalized === true && 
        notification.fromAdmin === true &&
        (notification.targetUserId === user?._id || notification.targetUserId === 'all')
      );
      setNotifications(adminNotifications);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      // Fallback avec des notifications vides si l'API échoue
      setNotifications([]);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };




  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo et Navigation */}
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <img 
                    src="/images/LogoPharma.jpg" 
                    alt="PharmaMOS Logo" 
                    className="h-16 w-auto"
                  />
                </div>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-6">
              {/* Navigation Tabs */}
              <button
                onClick={() => setActiveTab('accueil')}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'accueil' 
                    ? 'text-primary-600 border-b-2 border-primary-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Accueil</span>
              </button>
              <button
                onClick={() => setActiveTab('produits')}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'produits' 
                    ? 'text-primary-600 border-b-2 border-primary-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Package className="h-4 w-4" />
                <span>Produits</span>
              </button>
              
              {/* User Dropdowns */}
              <UserDropdowns user={user} />
              
              {/* Cart */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 text-gray-400 hover:text-gray-500 transition-colors"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getCartItemsCount()}
                  </span>
                )}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <Bell className="h-6 w-6" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-40">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-medium text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`h-2 w-2 rounded-full mt-2 ${
                              notification.type === 'stock' ? 'bg-blue-500' :
                              notification.type === 'promo' ? 'bg-green-500' :
                              'bg-yellow-500'
                            }`}></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {notification.time || new Date().toLocaleString('fr-FR', { 
                                  day: '2-digit', 
                                  month: '2-digit', 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile */}
              <UserProfile user={user} onLogout={logout} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'accueil' && (
          <>
            {/* Hero Section */}
            <HeroSection
              user={user}
              onShowServices={() => setShowServices(true)}
              onShowHealthTips={() => setShowHealthTips(true)}
              onShowPharmacyContact={() => setShowPharmacyContact(true)}
            />
          </>
        )}

        {activeTab === 'produits' ? (
          <ProductsGrid />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Section d'accueil de pharmacie interactive */}
            <PharmacyWelcomeSection 
              onShowPharmacyInfo={() => setShowPharmacyInfo(true)} 
              onShowPharmacyContact={() => setShowPharmacyContact(true)}
              onAppointmentClick={handleAppointmentClick}
            />
            
            
            {/* Sections centrées */}
            <div className="flex flex-col items-center space-y-10">
              {/* Section de téléchargement d'ordonnance */}
              <div className="w-full max-w-5xl">
                <PrescriptionUpload />
              </div>
              
              {/* Section rendez-vous en bas */}
              <div className="w-full max-w-5xl">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                  <div className="text-center">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6">Besoin d'une consultation ?</h3>
                    <p className="text-gray-600 mb-8 text-lg">
                      Prenez rendez-vous avec notre pharmacien pour des conseils personnalisés
                    </p>
                    <button 
                      onClick={handleAppointmentClick}
                      className="bg-gradient-to-r from-primary-600 to-green-600 hover:from-primary-700 hover:to-green-700 text-white px-10 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2 mx-auto text-lg"
                    >
                      <Calendar className="h-6 w-6" />
                      <span>Prendre rendez-vous</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">



            {/* Quick Cart */}
            <QuickCart
              cartItems={cartItems}
              onUpdateQuantity={updateCartQuantity}
              onRemoveItem={removeFromCart}
              onViewFullCart={() => setCartOpen(true)}
            />

            
            {/* Quick Actions */}
            <div className="card">
              <h4 className="font-medium text-gray-900 mb-4">Actions rapides</h4>
              <div className="space-y-2">
                <button 
                  onClick={() => setShowPayment(true)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center space-x-3"
                >
                  <ShoppingCart className="h-5 w-5 text-primary-600" />
                  <span className="text-sm font-medium">Payer mes achats</span>
                </button>
                <button 
                  onClick={() => setShowPharmacyContact(true)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center space-x-3"
                >
                  <Phone className="h-5 w-5 text-primary-600" />
                  <span className="text-sm font-medium">Appeler PharmaMOS</span>
                </button>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                  <h5 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Plus de conseils santé
                  </h5>
                  <p className="text-sm text-blue-800 mb-3">
                    Découvrez nos conseils personnalisés en herboristerie, aromathérapie et bien-être
                  </p>
                  <button 
                    onClick={() => setShowHealthTips(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                  >
                    <Heart className="h-4 w-4" />
                    <span>Voir les conseils</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateCartQuantity}
      />

      {/* Chat Widget */}
      <ClientChatWidget predefinedMessage={chatPredefinedMessage} isOpen={showChat} onClose={() => setShowChat(false)} />
      
      {/* Health Tips Modal */}
      <HealthTipsModal 
        isOpen={showHealthTips}
        onClose={() => setShowHealthTips(false)}
      />

      {/* Pharmacy Contact Modal */}
      <PharmacyContactModal 
        isOpen={showPharmacyContact}
        onClose={() => setShowPharmacyContact(false)}
      />

      {/* Services Modal */}
      <ServicesModal 
        isOpen={showServices}
        onClose={() => setShowServices(false)}
      />

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        cartTotal={cartTotal}
        onPaymentSuccess={() => {
          // Handle payment success - clear cart and reload products
          clearCart();
          console.log('Payment successful - cart cleared');
        }}
      />

      {/* Pharmacy Info Modal */}
      <PharmacyInfoModal 
        isOpen={showPharmacyInfo}
        onClose={() => setShowPharmacyInfo(false)}
      />


      {/* Click outside handlers */}
      {(showNotifications || showUserMenu || showFilters) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
            setShowFilters(false);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
