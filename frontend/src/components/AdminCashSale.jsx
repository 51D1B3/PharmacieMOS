import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, ShoppingCart, DollarSign, Receipt, X, Package } from 'lucide-react';
import apiService from '../services/api.jsx';

const AdminCashSale = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProducts({ limit: 100 });
      const productsData = response?.data || [];
      setProducts(productsData.filter(p => p.isActive && (p.stock?.onHand || 0) > 0));
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product._id === product._id);
    const availableStock = product.stock?.onHand || 0;
    
    if (existingItem) {
      if (existingItem.quantity < availableStock) {
        setCart(cart.map(item =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      if (availableStock > 0) {
        setCart([...cart, { product, quantity: 1 }]);
      }
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.product._id !== productId));
    } else {
      const product = products.find(p => p._id === productId);
      const maxQuantity = product?.stock?.onHand || 0;
      
      if (newQuantity <= maxQuantity) {
        setCart(cart.map(item =>
          item.product._id === productId
            ? { ...item, quantity: newQuantity }
            : item
        ));
      }
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product._id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.product.priceTTC * item.quantity), 0);
  };

  const processCashSale = async () => {
    if (cart.length === 0) {
      alert('Veuillez ajouter des produits au panier');
      return;
    }

    setProcessing(true);
    try {
      // Créer la commande de vente en espèces
      const orderData = {
        orderType: 'vente_pos',
        deliveryMethod: 'pickup',
        payment: {
          method: 'cash',
          status: 'paid',
          amount: calculateTotal(),
          paidAt: new Date()
        },
        items: cart.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          priceHT: item.product.priceHT || (item.product.priceTTC / (1 + (item.product.taxRate || 0) / 100)),
          priceTTC: item.product.priceTTC,
          taxRate: item.product.taxRate || 0,
          totalHT: (item.product.priceHT || (item.product.priceTTC / (1 + (item.product.taxRate || 0) / 100))) * item.quantity,
          totalTTC: item.product.priceTTC * item.quantity
        })),
        status: 'completed'
      };

      const response = await apiService.createOrder(orderData);
      
      if (response) {
        alert(`Vente enregistrée avec succès!\nNuméro de vente: ${response.orderNumber || 'N/A'}\nTotal: ${calculateTotal().toLocaleString()} GNF`);
        setCart([]);
        loadProducts(); // Recharger pour mettre à jour les stocks
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la vente:', error);
      alert('Erreur lors de l\'enregistrement de la vente');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <DollarSign className="h-6 w-6 mr-2 text-green-600" />
          Vente en Espèces
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section Produits */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucun produit trouvé
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div key={product._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3 flex-1">
                    {/* Photo du produit */}
                    <div className="flex-shrink-0 h-12 w-12">
                      {product.image ? (
                        <img
                          src={`${process.env.REACT_APP_API_URL}${product.image}`}
                          alt={product.name}
                          className="h-12 w-12 rounded-lg object-cover"
                          onError={(e) => {
                            e.target.src = `https://via.placeholder.com/100x100.png/f3f4f6/9ca3af?text=${encodeURIComponent(product.name?.substring(0, 2) || 'PR')}`;
                          }}
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Informations produit */}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-600">{product.brand} - {product.dosage}</p>
                      <p className="text-sm font-medium text-green-600">{product.priceTTC?.toLocaleString()} GNF</p>
                      <p className="text-xs text-gray-500">Stock: {product.stock?.onHand || 0}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={(product.stock?.onHand || 0) === 0}
                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section Panier */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Panier ({cart.length} articles)
          </h4>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Panier vide
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{item.product.name}</h5>
                    <p className="text-sm text-gray-600">{item.product.priceTTC?.toLocaleString()} GNF × {item.quantity}</p>
                    <p className="text-sm font-medium text-green-600">
                      {(item.product.priceTTC * item.quantity).toLocaleString()} GNF
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                      disabled={item.quantity >= (item.product.stock?.onHand || 0)}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.product._id)}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Total et bouton de validation */}
          {cart.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-xl font-bold text-green-600">
                  {calculateTotal().toLocaleString()} GNF
                </span>
              </div>
              <button
                onClick={processCashSale}
                disabled={processing}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center space-x-2"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Traitement...</span>
                  </>
                ) : (
                  <>
                    <Receipt className="h-4 w-4" />
                    <span>Enregistrer la Vente</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCashSale;
