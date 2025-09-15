import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Plus, Minus, Trash2, Receipt, 
  Search, Package, Calculator, CreditCard, Printer
} from 'lucide-react';

const PharmacistSales = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: ''
  });
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    // Simuler des produits disponibles
    const mockProducts = [
      {
        id: 1,
        name: 'Paracétamol 500mg',
        price: 2500,
        stock: 150,
        category: 'Antalgiques'
      },
      {
        id: 2,
        name: 'Amoxicilline 250mg',
        price: 8500,
        stock: 75,
        category: 'Antibiotiques'
      },
      {
        id: 3,
        name: 'Aspirine 500mg',
        price: 3200,
        stock: 100,
        category: 'Anti-inflammatoires'
      },
      {
        id: 4,
        name: 'Vitamine C 1000mg',
        price: 4200,
        stock: 200,
        category: 'Vitamines'
      },
      {
        id: 5,
        name: 'Sirop contre la toux',
        price: 6800,
        stock: 45,
        category: 'Sirops'
      }
    ];
    setProducts(mockProducts);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const product = products.find(p => p.id === productId);
    if (newQuantity <= product.stock) {
      setCart(cart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const processSale = () => {
    if (cart.length === 0) {
      alert('Le panier est vide');
      return;
    }

    const sale = {
      id: Date.now(),
      items: [...cart],
      customer: customerInfo,
      total: getTotalAmount(),
      date: new Date().toISOString(),
      paymentMethod: 'cash'
    };

    // Simuler la mise à jour du stock
    const updatedProducts = products.map(product => {
      const cartItem = cart.find(item => item.id === product.id);
      if (cartItem) {
        return { ...product, stock: product.stock - cartItem.quantity };
      }
      return product;
    });

    setProducts(updatedProducts);
    setLastSale(sale);
    setCart([]);
    setCustomerInfo({ name: '', phone: '' });
    setShowReceipt(true);
  };

  const printReceipt = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Liste des produits */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <Package className="h-6 w-6 mr-2 text-blue-600" />
            Produits Disponibles
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{product.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{product.category}</p>
                </div>
                <span className="text-lg font-bold text-blue-600">{product.price.toLocaleString()} GNF</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className={`text-sm ${product.stock > 10 ? 'text-green-600' : 'text-orange-600'}`}>
                  Stock: {product.stock}
                </span>
                <button
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ajouter</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Panier et caisse */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
          <ShoppingCart className="h-6 w-6 mr-2 text-green-600" />
          Panier ({cart.length})
        </h3>

        {/* Informations client */}
        <div className="mb-6 space-y-3">
          <input
            type="text"
            placeholder="Nom du client (optionnel)"
            value={customerInfo.name}
            onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <input
            type="tel"
            placeholder="Téléphone (optionnel)"
            value={customerInfo.phone}
            onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Articles du panier */}
        <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
          {cart.map((item) => (
            <div key={item.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">{item.name}</h4>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 w-6 h-6 rounded flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-8 text-center font-medium text-gray-900 dark:text-gray-100">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 w-6 h-6 rounded flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {(item.price * item.quantity).toLocaleString()} GNF
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Total et paiement */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total:</span>
            <span className="text-2xl font-bold text-green-600">{getTotalAmount().toLocaleString()} GNF</span>
          </div>
          
          <button
            onClick={processSale}
            disabled={cart.length === 0}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <CreditCard className="h-5 w-5" />
            <span>Finaliser la Vente</span>
          </button>
        </div>
      </div>

      {/* Modal de reçu */}
      {showReceipt && lastSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <Receipt className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Vente Terminée</h3>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
              <div className="text-center mb-4">
                <h4 className="font-bold text-gray-900 dark:text-gray-100">PHARMACIE PHARMAOS</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">Reçu de vente</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(lastSale.date).toLocaleString('fr-FR')}
                </p>
              </div>

              {lastSale.customer.name && (
                <div className="mb-3">
                  <p className="text-sm"><strong>Client:</strong> {lastSale.customer.name}</p>
                  {lastSale.customer.phone && (
                    <p className="text-sm"><strong>Tél:</strong> {lastSale.customer.phone}</p>
                  )}
                </div>
              )}

              <div className="space-y-2 mb-4">
                {lastSale.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.name} x{item.quantity}</span>
                    <span>{(item.price * item.quantity).toLocaleString()} GNF</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-300 dark:border-gray-600 pt-2">
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>{lastSale.total.toLocaleString()} GNF</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowReceipt(false)}
                className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              >
                Fermer
              </button>
              <button
                onClick={printReceipt}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
              >
                <Printer className="h-4 w-4" />
                <span>Imprimer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacistSales;