import React, { useState, useEffect, useCallback } from 'react';
import { User, Package, Heart, Settings, Mail, Phone, Star, Bell, ShoppingCart, Plus, Eye, QrCode, Search, X } from 'lucide-react';
import apiService from '../services/api';

const UserDropdowns = ({ user }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;
  const [ordersLoading, setOrdersLoading] = useState(false);

  const handleMouseEnter = (dropdown) => {
    setActiveDropdown(dropdown);
  };

  const handleMouseLeave = () => {
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
    <div className="flex items-center space-x-6">
      {/* Mon Profil */}
      <div 
        className="relative"
        onMouseEnter={() => handleMouseEnter('profile')}
        onMouseLeave={handleMouseLeave}
      >
        <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors">
          <User className="h-5 w-5" />
          <span className="text-sm font-medium">Mon profil</span>
        </button>

        {activeDropdown === 'profile' && (
          <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-4">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                  <User className="h-10 w-10 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{userProfileData.fullName}</h4>
                  <p className="text-sm text-gray-500">Client fidèle</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{userProfileData.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{userProfileData.phone}</span>
                </div>
              </div>
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
        <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors">
          <Package className="h-5 w-5" />
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
        <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors">
          <Settings className="h-5 w-5" />
          <span className="text-sm font-medium">Paramètres</span>
        </button>

        {activeDropdown === 'settings' && (
          <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-4">Paramètres</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Notifications</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Emails promotionnels</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Préférences</h5>
                  <div className="space-y-2">
                    <button className="w-full text-left text-sm text-gray-700 hover:text-primary-600 py-1">
                      Langue et région
                    </button>
                    <button className="w-full text-left text-sm text-gray-700 hover:text-primary-600 py-1">
                      Confidentialité
                    </button>
                    <button className="w-full text-left text-sm text-gray-700 hover:text-primary-600 py-1">
                      Sécurité du compte
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDropdowns;
