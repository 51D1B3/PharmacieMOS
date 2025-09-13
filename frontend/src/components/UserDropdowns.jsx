import React, { useState, useEffect, useCallback } from 'react';
import { User, Package, Heart, Settings, Mail, Phone, Star, Bell, ShoppingCart, Plus, Eye, QrCode, Search, X, Shield, Globe, Lock } from 'lucide-react';
import apiService from '../services/api';

const UserDropdowns = ({ user, onShowProfile }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;
  const [ordersLoading, setOrdersLoading] = useState(false);

  const handleMouseEnter = (dropdown) => {
    setActiveDropdown(dropdown);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  const handleNotificationToggle = (enabled) => {
    setNotificationsEnabled(enabled);
    // Ici vous pouvez ajouter la logique pour sauvegarder la préférence
    console.log('Notifications:', enabled ? 'activées' : 'désactivées');
  };

  const openLanguageSettings = () => {
    // Ouvrir les paramètres Windows - Langue et région
    window.open('ms-settings:regionlanguage', '_blank');
  };

  const openPrivacySettings = () => {
    // Ouvrir les paramètres Windows - Confidentialité et sécurité
    window.open('ms-settings:privacy', '_blank');
  };

  const openSecurityModal = () => {
    setShowSecurityModal(true);
    setActiveDropdown(null);
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProducts({ limit: 50 }); // Augmenter la limite pour avoir plus de produits
      const productsData = response?.data || [];
      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      const ordersResponse = await apiService.getOrders();
      const userOrders = (ordersResponse || []).filter(order => 
        order.userId === user?._id || order.user?._id === user?._id
      ).slice(0, 5);
      setOrders(userOrders);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fonction de recherche de produits
  const handleSearchChange = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term) ||
        product.category?.toLowerCase().includes(term)
      );
      setFilteredProducts(filtered);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setFilteredProducts(products);
  };

  const loadOrdersCallback = useCallback(loadOrders, [user?._id]);

  useEffect(() => {
    if (activeDropdown === 'products') {
      loadProducts();
      setSearchTerm(''); // Reset search when opening
    } else if (activeDropdown === 'orders') {
      loadOrdersCallback();
    }
  }, [activeDropdown, user?._id, loadOrdersCallback]);

  const userProfileData = {
    fullName: `${user?.prenom || ''} ${user?.nom || ''}`.trim() || 'Utilisateur',
    email: user?.email || 'email@example.com',
    phone: user?.telephone || '+224623841149'
  };

  // Fonction pour formater le statut des commandes
  const getOrderStatusLabel = (status) => {
    const statusMap = {
      'pending': 'En attente',
      'confirmed': 'Confirmée',
      'processing': 'En cours',
      'shipped': 'Expédiée',
      'delivered': 'Livrée',
      'cancelled': 'Annulée',
      'completed': 'Terminée'
    };
    return statusMap[status] || status;
  };




  return (
    <>
    <div className="flex items-center space-x-6">
      {/* Mon Profil */}
      <div 
        className="relative"
        onMouseEnter={() => handleMouseEnter('profile')}
        onMouseLeave={handleMouseLeave}
      >
        <button className="flex items-center space-x-2 text-white hover:text-primary-200 transition-colors">
          <User className="h-5 w-5 text-white" />
          <span className="text-sm font-medium">Mon profil</span>
        </button>

        {activeDropdown === 'profile' && (
          <div className="absolute top-full right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
            <div className="p-4">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                  {user?.profileImage ? (
                    <img 
                      src={user.profileImage.startsWith('http') ? user.profileImage : `${import.meta.env.VITE_API_URL || ''}${user.profileImage}`}
                      alt={`${user.prenom} ${user.nom}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white">{userProfileData.fullName}</h4>
                  <p className="text-sm text-gray-400">Client fidèle</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">{userProfileData.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">{userProfileData.phone}</span>
                </div>
              </div>
              
              <button
                onClick={() => {
                  onShowProfile && onShowProfile();
                  setActiveDropdown(null);
                }}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span>Mon profil</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mes Commandes */}
      <div 
        className="relative"
        onMouseEnter={() => handleMouseEnter('orders')}
        onMouseLeave={handleMouseLeave}
      >
        <button className="flex items-center space-x-2 text-white hover:text-primary-200 transition-colors">
          <Package className="h-5 w-5 text-white" />
          <span className="text-sm font-medium">Mes commandes</span>
        </button>

        {activeDropdown === 'orders' && (
          <div className="absolute top-full right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-4">Historique des commandes</h4>
              {ordersLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {orders.length > 0 ? orders.map((order) => (
                      <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Commande #{order._id?.slice(-6) || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{order.totalAmount || 0} GNF</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            order.status === 'delivered' || order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'processing' || order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {getOrderStatusLabel(order.status)}
                          </span>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-gray-500">
                        <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">Aucune commande trouvée</p>
                      </div>
                    )}
                  </div>
                  

                </>
              )}
            </div>
          </div>
        )}
      </div>



      {/* Paramètres */}
      <div 
        className="relative"
        onMouseEnter={() => handleMouseEnter('settings')}
        onMouseLeave={handleMouseLeave}
      >
        <button className="flex items-center space-x-2 text-white hover:text-primary-200 transition-colors">
          <Settings className="h-5 w-5 text-white" />
          <span className="text-sm font-medium">Paramètres</span>
        </button>

        {activeDropdown === 'settings' && (
          <div className="absolute top-full right-0 mt-2 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
            <div className="p-4">
              <h4 className="font-medium text-white mb-4">Paramètres</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-300">Notifications</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={notificationsEnabled}
                      onChange={(e) => handleNotificationToggle(e.target.checked)}
                    />
                    <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-300">Emails promotionnels</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="pt-3 border-t border-gray-600">
                  <h5 className="text-sm font-medium text-white mb-2">Préférences</h5>
                  <div className="space-y-2">
                    <button 
                      onClick={openLanguageSettings}
                      className="w-full text-left text-sm text-gray-300 hover:text-primary-400 py-1 flex items-center space-x-2"
                    >
                      <Globe className="h-4 w-4" />
                      <span>Langue et région</span>
                    </button>
                    <button 
                      onClick={openPrivacySettings}
                      className="w-full text-left text-sm text-gray-300 hover:text-primary-400 py-1 flex items-center space-x-2"
                    >
                      <Shield className="h-4 w-4" />
                      <span>Confidentialité</span>
                    </button>
                    <button 
                      onClick={openSecurityModal}
                      className="w-full text-left text-sm text-gray-300 hover:text-primary-400 py-1 flex items-center space-x-2"
                    >
                      <Lock className="h-4 w-4" />
                      <span>Sécurité du compte</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    
    {/* Modal de sécurité du compte */}
    {showSecurityModal && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Lock className="h-6 w-6 mr-2 text-primary-400" />
              Sécurité du compte
            </h2>
            <button
              onClick={() => setShowSecurityModal(false)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-400" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Statut de sécurité */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-green-400" />
                Statut de sécurité
              </h3>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-400 font-medium">Compte sécurisé</span>
              </div>
              <p className="text-gray-300 text-sm">
                Votre compte PharmaMOS est protégé par nos mesures de sécurité avancées. 
                Nous utilisons un chiffrement de bout en bout pour protéger vos données médicales sensibles.
              </p>
            </div>

            {/* Authentification */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Authentification</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Mot de passe</p>
                    <p className="text-gray-400 text-sm">Dernière modification il y a 15 jours</p>
                  </div>
                  <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors">
                    Modifier
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Authentification à deux facteurs (2FA)</p>
                    <p className="text-gray-400 text-sm">Sécurisez votre compte avec une double vérification</p>
                  </div>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                    Activer
                  </button>
                </div>
              </div>
            </div>

            {/* Sessions actives */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Sessions actives</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Session actuelle</p>
                    <p className="text-gray-400 text-sm">Windows • Chrome • Conakry, Guinée</p>
                    <p className="text-gray-500 text-xs">Dernière activité: maintenant</p>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Données médicales */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Heart className="h-5 w-5 mr-2 text-red-400" />
                Protection des données médicales
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-white text-sm font-medium">Chiffrement AES-256</p>
                    <p className="text-gray-400 text-xs">Vos ordonnances et données médicales sont chiffrées</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-white text-sm font-medium">Conformité RGPD</p>
                    <p className="text-gray-400 text-xs">Respect des normes européennes de protection des données</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-white text-sm font-medium">Accès contrôlé</p>
                    <p className="text-gray-400 text-xs">Seuls les pharmaciens autorisés peuvent consulter vos données</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommandations */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recommandations de sécurité</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
                  <Bell className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-white text-sm font-medium">Activez les notifications de sécurité</p>
                    <p className="text-gray-400 text-xs">Soyez alerté en cas d'activité suspecte</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                  <Lock className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="text-white text-sm font-medium">Utilisez un mot de passe fort</p>
                    <p className="text-gray-400 text-xs">Minimum 12 caractères avec majuscules, chiffres et symboles</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );}
};

export default UserDropdowns;
