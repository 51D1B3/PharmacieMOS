import React from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Package, ArrowRight } from 'lucide-react';
import { formatPrice } from '../services/priceFormatter';

const QuickCart = ({ cartItems, onUpdateQuantity, onRemoveItem, onViewFullCart }) => {
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.product.priceTTC * item.quantity), 0);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity >= 0) {
      onUpdateQuantity(productId, newQuantity);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900 flex items-center">
          <ShoppingCart className="h-5 w-5 mr-2" />
          Panier rapide
        </h4>
        {cartItems.length > 0 && (
          <span className="text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded-full">
            {totalItems}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {cartItems.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Votre panier est vide</p>
            <p className="text-sm text-gray-400">Ajoutez des produits pour commencer</p>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {cartItems.slice(0, 4).map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  {/* Product Image */}
                  <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    {item.product.images && item.product.images.length > 0 ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="h-5 w-5 text-gray-400 m-auto" />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate font-medium">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.product.dosage} - {item.product.form}
                    </p>
                    <p className="text-sm font-medium text-primary-600">
                      {formatPrice(item.product.priceTTC)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-200"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm font-medium text-gray-900 w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-200"
                      disabled={item.quantity >= (item.product.stock?.onHand || 0)}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => onRemoveItem(item.product._id)}
                      className="p-1 text-red-400 hover:text-red-600 rounded hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Show more indicator */}
              {cartItems.length > 4 && (
                <div className="text-center py-2">
                  <p className="text-xs text-gray-500">
                    +{cartItems.length - 4} autre(s) article(s)
                  </p>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-gray-900">Total ({totalItems} articles)</span>
                <span className="font-bold text-lg text-gray-900">
                  {formatPrice(totalAmount)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={onViewFullCart}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Voir le panier complet</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button className="text-xs bg-green-50 text-green-600 py-2 px-3 rounded-lg hover:bg-green-100 transition-colors font-medium">
                    Commander
                  </button>
                  <button className="text-xs bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                    Réserver
                  </button>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  💡 Livraison gratuite à partir de 500 000 GNF d'achat
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuickCart;
