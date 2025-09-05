import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Plus, Minus, CreditCard, Banknote, Smartphone } from 'lucide-react';
import apiService from '../services/api';
import { formatPrice } from '../services/priceFormatter';

const AdminDirectSale = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await apiService.getProducts({ limit: 100 });
      setProducts(response?.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product) => {
    const existing = cart.find(item => item._id === product._id);
    if (existing) {
      setCart(cart.map(item =>
        item._id === product._id
          ? { ...item, quantity: Math.min(item.quantity + 1, product.stock?.onHand || 0) }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item._id !== productId));
    } else {
      setCart(cart.map(item =>
        item._id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.priceTTC * item.quantity), 0);

  const processSale = async () => {
    if (cart.length === 0) return;

    setProcessing(true);
    try {
      const saleData = {
        orderType: 'vente_pos',
        items: cart.map(item => ({
          product: item._id,
          quantity: item.quantity,
          priceHT: item.priceHT,
          priceTTC: item.priceTTC,
          totalTTC: item.priceTTC * item.quantity
        })),
        totalTTC: total,
        payment: {
          method: paymentMethod,
          status: 'paid',
          amount: total,
          paidAt: new Date()
        },
        status: 'completed'
      };

      await apiService.createOrder(saleData);
      
      // Mettre à jour les stocks
      for (const item of cart) {
        await fetch(`${process.env.REACT_APP_API_URL}/api/products/${item._id}/stock`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            quantity: -item.quantity,
            reason: 'sale'
          })
        });
      }

      alert('Vente enregistrée avec succès !');
      setCart([]);
      loadProducts();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la vente');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-2xl font-semibold text-gray-900 mb-6">Vente Directe</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produits */}
        <div>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredProducts.map(product => (
              <div key={product._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-500">{formatPrice(product.priceTTC)} - Stock: {product.stock?.onHand || 0}</p>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  disabled={!product.stock?.onHand}
                  className="bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700 disabled:bg-gray-300"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Panier */}
        <div>
          <h4 className="font-semibold mb-4">Panier ({cart.length})</h4>
          
          <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
            {cart.map(item => (
              <div key={item._id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">{formatPrice(item.priceTTC)} x {item.quantity}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    disabled={item.quantity >= (item.stock?.onHand || 0)}
                    className="p-1 text-gray-500 hover:text-gray-700 disabled:text-gray-300"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {cart.length > 0 && (
            <>
              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Méthode de paiement:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 border rounded-lg flex flex-col items-center ${paymentMethod === 'cash' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`}
                  >
                    <Banknote className="h-5 w-5 mb-1" />
                    <span className="text-sm">Espèces</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('mobile_money')}
                    className={`p-3 border rounded-lg flex flex-col items-center ${paymentMethod === 'mobile_money' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`}
                  >
                    <Smartphone className="h-5 w-5 mb-1" />
                    <span className="text-sm">Mobile Money</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('orange_money')}
                    className={`p-3 border rounded-lg flex flex-col items-center ${paymentMethod === 'orange_money' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`}
                  >
                    <Smartphone className="h-5 w-5 mb-1" />
                    <span className="text-sm">Orange Money</span>
                  </button>
                </div>
              </div>

              <button
                onClick={processSale}
                disabled={processing}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold disabled:bg-gray-400"
              >
                {processing ? 'Traitement...' : 'Valider la vente'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDirectSale;