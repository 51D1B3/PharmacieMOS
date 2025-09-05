import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, Calendar, CreditCard, Smartphone, Phone } from 'lucide-react';
import PaymentModal from './PaymentModal.jsx';
import { formatPrice } from '../services/priceFormatter';

const CartDrawer = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
}) => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [isReserving, setIsReserving] = useState(false);
  const [pickupDate, setPickupDate] = useState('');
  const [notes, setNotes] = useState('');
  const [showMobilePayment, setShowMobilePayment] = useState(false);
  const [mobilePaymentMethod, setMobilePaymentMethod] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.product.priceTTC * item.quantity), 0);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity >= 0) {
      onUpdateQuantity(productId, newQuantity);
    }
  };



  const handleMobilePayment = async (paymentMethod) => {
    if (!phoneNumber) {
      alert('Veuillez saisir votre numéro de téléphone');
      return;
    }

    // Validation du numéro de téléphone guinéen
    const phoneRegex = /^(6[0-9]{8}|[0-9]{8,9})$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      alert('Veuillez saisir un numéro de téléphone valide');
      return;
    }

    setIsReserving(true);
    try {
      // Ici vous appelleriez l'API pour créer la commande avec paiement mobile
      console.log('Création de commande avec paiement mobile:', {
        items: items.map(item => ({
          productId: item.product._id,
          quantity: item.quantity,
        })),
        paymentMethod: paymentMethod,
        phoneNumber: phoneNumber,
        totalAmount: totalAmount
      });
      
      // Simuler un délai
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`Commande créée avec succès !\nUn SMS sera envoyé au ${phoneNumber} pour confirmer le paiement ${paymentMethod === 'orange_money' ? 'Orange Money' : 'Mobile Money'}.`);
      setShowMobilePayment(false);
      setPhoneNumber('');
      setMobilePaymentMethod('');
      onClose();
    } catch (error) {
      alert('Erreur lors de la création de la commande');
    } finally {
      setIsReserving(false);
    }
  };

  const handleOrder = async () => {
    setIsReserving(true);
    try {
      // Créer la commande via l'API
      const orderData = {
        orderType: 'commande',
        deliveryMethod: 'delivery',
        items: items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          priceHT: item.product.priceHT || (item.product.priceTTC / (1 + (item.product.taxRate || 0) / 100)),
          priceTTC: item.product.priceTTC,
          taxRate: item.product.taxRate || 0,
          totalHT: (item.product.priceHT || (item.product.priceTTC / (1 + (item.product.taxRate || 0) / 100))) * item.quantity,
          totalTTC: item.product.priceTTC * item.quantity
        })),
        status: 'pending',
        notes: notes,
        deliveryDate: pickupDate || new Date().toISOString().split('T')[0]
      };

      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la commande');
      }
      
      alert('Commande créée avec succès ! L\'admin sera notifié pour organiser la livraison.');
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création de la commande');
    } finally {
      setIsReserving(false);
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
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Mon Panier</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full">
          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Votre panier est vide</h3>
                <p className="text-gray-500">Ajoutez des produits pour commencer vos achats</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product._id} className="flex space-x-4 p-4 border border-gray-200 rounded-lg">
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
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {item.product.dosage} - {item.product.form}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
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
            <div className="border-t border-gray-200 p-6 space-y-4">
              {/* Summary */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total ({totalItems} articles)</span>
                <span className="font-medium text-gray-900">{formatPrice(totalAmount)}</span>
              </div>

              {/* Pickup Date for Reservation */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Date de retrait souhaitée
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
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
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="delivery"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="delivery" className="text-sm text-gray-700">
                    Livraison à domicile (+5 000 GNF)
                  </label>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    disabled={isReserving}
                    className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 px-4 rounded-lg hover:from-orange-600 hover:to-yellow-600 disabled:bg-gray-400 flex items-center justify-center space-x-2 font-semibold"
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>Payer par Mobile Money</span>
                  </button>

                  <button
                    onClick={handleOrder}
                    disabled={isReserving}
                    className="w-full btn-secondary flex items-center justify-center space-x-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Acheter en ligne</span>
                  </button>
                </div>
                ) : (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">
                        {mobilePaymentMethod === 'orange_money' ? 'Orange Money' : 'Mobile Money'}
                      </h4>
                      <button
                        onClick={() => {
                          setShowMobilePayment(false);
                          setPhoneNumber('');
                          setMobilePaymentMethod('');
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Numéro de téléphone
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Ex: 628123456 ou 664123456"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500">
                        Saisissez votre numéro sans le +224
                      </p>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white rounded border">
                      <span className="font-medium text-gray-900">Total à payer:</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatPrice(totalAmount)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleMobilePayment(mobilePaymentMethod)}
                      disabled={isReserving || !phoneNumber}
                      className={`w-full py-3 px-4 rounded-lg text-white font-medium disabled:bg-gray-400 flex items-center justify-center space-x-2 ${
                        mobilePaymentMethod === 'orange_money' 
                          ? 'bg-orange-500 hover:bg-orange-600' 
                          : 'bg-yellow-500 hover:bg-yellow-600'
                      }`}
                    >
                      {isReserving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Traitement...</span>
                        </>
                      ) : (
                        <>
                          {mobilePaymentMethod === 'orange_money' ? (
                            <Smartphone className="h-4 w-4" />
                          ) : (
                            <Phone className="h-4 w-4" />
                          )}
                          <span>
                            Confirmer le paiement {mobilePaymentMethod === 'orange_money' ? 'Orange Money' : 'Mobile Money'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}
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
          // Close drawer on successful payment - cart clearing handled by parent
          onClose();
        }}
      />
    </>
  );
};

export default CartDrawer;
