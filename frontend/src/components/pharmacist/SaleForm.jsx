import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search } from 'lucide-react';

const SaleForm = ({ onSaleComplete }) => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [clientName, setClientName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch('http://localhost:5005/api/products');
      const data = await response.json();
      setProducts(data.data || []);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5005/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct,
          quantity: parseInt(quantity),
          clientName: clientName || 'Client anonyme'
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Vente enregistrée avec succès !');
        setSelectedProduct('');
        setQuantity(1);
        setClientName('');
        if (onSaleComplete) onSaleComplete(data.data);
      } else {
        alert(data.message || 'Erreur lors de la vente');
      }
    } catch (error) {
      alert('Erreur lors de la vente');
    } finally {
      setLoading(false);
    }
  };

  const selectedProductData = products.find(p => p._id === selectedProduct);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
        <ShoppingCart className="h-5 w-5 mr-2 text-green-600" />
        Nouvelle Vente
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Produit</label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
          >
            <option value="">Sélectionner un produit</option>
            {products.map(product => (
              <option key={product._id} value={product._id}>
                {product.name} - {product.price || product.priceTTC} GNF (Stock: {product.stock?.onHand || product.stock || 0})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Quantité</label>
          <input
            type="number"
            min="1"
            max={selectedProductData?.stock?.onHand || selectedProductData?.stock || 999}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Nom du client (optionnel)</label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Client anonyme"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        {selectedProductData && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Prix unitaire: {selectedProductData.price || selectedProductData.priceTTC} GNF
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Total: {((selectedProductData.price || selectedProductData.priceTTC) * quantity).toLocaleString()} GNF
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !selectedProduct}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
        >
          {loading ? 'Enregistrement...' : 'Enregistrer la vente'}
        </button>
      </form>
    </div>
  );
};

export default SaleForm;