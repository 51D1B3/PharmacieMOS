import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, Smartphone } from 'lucide-react';
import PaymentModal from './PaymentModal.jsx';
import { formatPrice } from '../services/priceFormatter';

const CartDrawer = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
}) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [isReserving, setIsReserving] = useState(false);
  const [notes, setNotes] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.product.priceTTC * item.quantity), 0);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity >= 0) {
      onUpdateQuantity(productId, newQuantity);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
  <div className="flex items-center justify-between p-1 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Mon Panier</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
  <div className="flex flex-col h-full pt-0 mt-[-8px]">
          {/* Items */}
          <div className="flex-1 overflow-y-auto p-3 bg-white dark:bg-gray-900">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2
 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Votre panier est vide</h3>
                <p className="text-gray-500">Ajoutez des produits pour commencer vos achats</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product._id} className="flex space-x-2 p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                      {item.product.image ? (
                        <img
                          src={`${process.env.REACT_APP_API_URL}${item.product.image}`}
                          alt={item.product.name || 'Product image'}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/150?text=No+Image" }} // Fallback for broken images
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-gray-400 dark:text-gray-300">
                        {item.product.dosage} - {item.product.form}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatPrice(item.product.priceTTC)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-sm font-medium text-gray-900 w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        disabled={item.quantity >= (item.product.stock?.onHand || 0)}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleQuantityChange(item.product._id, 0)}
                        className="p-1 text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-2 space-y-0 bg-white dark:bg-gray-900 -mt-8">
              {/* Summary */}
              <div className="flex justify-between text-sm mb-0">
                <span className="text-gray-600 dark:text-gray-300">Total ({totalItems} articles)</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatPrice(totalAmount)}</span>
              </div>

              {/* Notes */}
              <div className="mb-0">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-0">
                  Notes (optionnel)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="input-field"
                  placeholder="Instructions spéciales, allergies, etc."
                />
              </div>

              {/* Option de livraison */}
              <div className="mb-0">
                <div className="flex items-center space-x-2 mb-1">
                  <input
                    type="checkbox"
                    id="delivery"
                    className="rounded border-gray-300 dark:border-gray-700 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="delivery" className="text-sm text-gray-700 dark:text-gray-200">
                    Livraison à domicile
                  </label>
                </div>

                <div>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    disabled={isReserving}
                    className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 px-4 rounded-lg hover:from-orange-600 hover:to-yellow-600 disabled:bg-gray-400 flex items-center justify-center space-x-2 font-semibold -mt-5"
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>Acheter maintenant</span>
                  </button>
                  <button
                    onClick={() => {/* log paiement en ligne */}}
                    disabled={isReserving}
                    className="w-full btn-secondary flex items-center justify-center space-x-2 mt-2"
                  >
                    {/* Icône carte ou autre selon design */}
                    <span>Acheter en ligne</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        cartTotal={totalAmount}
        onPaymentSuccess={() => {
          // Ferme le panier après un paiement réussi
          onClose();
        }}
      />
    </>
  );
};

export default CartDrawer;
