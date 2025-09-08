import React, { useState } from 'react';
import { X, CreditCard, Check, AlertCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext.jsx';
import apiService from '../services/api';
import MedicationNoticeModal from './MedicationNoticeModal.jsx';
import { formatPrice } from '../services/priceFormatter';

const PaymentModal = ({ isOpen, onClose, cartTotal, onPaymentSuccess }) => {
  const { cartItems, clearCart } = useCart();
  const [selectedMethod, setSelectedMethod] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState(cartTotal || 0);
  const [pinCode, setPinCode] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showMedicationNotice, setShowMedicationNotice] = useState(false);
  const [purchasedMedications, setPurchasedMedications] = useState([]);

  const paymentMethods = [
    {
      id: 'orange_money',
      name: 'Orange Money',
      icon: '🟠',
      color: 'bg-orange-500',
      description: 'Paiement via Orange Money'
    },
    {
      id: 'mobile_money',
      name: 'Mobile Money',
      icon: '📱',
      color: 'bg-blue-500',
      description: 'Paiement via Mobile Money'
    }
  ];

  const handlePayment = async () => {
    if (!selectedMethod || !phoneNumber || !amount || !pinCode) {
      return;
    }

    setProcessing(true);

    try {
      // Create order with payment
      const orderData = {
        orderType: 'commande',
        deliveryMethod: 'pickup',
        payment: {
          method: selectedMethod,
          status: 'paid',
          amount: amount,
          paidAt: new Date()
        },
        items: cartItems.map(item => ({
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

      await apiService.createOrder(orderData);
      
      // Préparer les données des médicaments achetés
      const medications = cartItems.map(item => ({
        name: item.product.name,
        purchaseDate: new Date(),
        dosage: item.product.dosage || "Suivre les instructions du pharmacien",
        activeIngredient: item.product.activeIngredient || item.product.description,
        instructions: item.product.instructions || "Prendre selon les recommandations médicales",
        sideEffects: item.product.sideEffects || "Consultez votre pharmacien en cas d'effets indésirables"
      }));
      
      setPurchasedMedications(medications);
      setProcessing(false);
      setShowSuccess(true);
      
      // Afficher la notice après le message de succès
      setTimeout(() => {
        setShowSuccess(false);
        if (medications.length > 0) {
          setShowMedicationNotice(true);
        } else {
          clearCart();
          onPaymentSuccess();
          onClose();
          resetForm();
        }
      }, 3000);
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
      setProcessing(false);
      alert('Erreur lors du traitement du paiement');
    }
  };

  const handleMedicationNoticeClose = () => {
    setShowMedicationNotice(false);
    clearCart();
    onPaymentSuccess();
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setSelectedMethod('');
    setPhoneNumber('');
    setAmount(cartTotal || 0);
    setPinCode('');
    setShowMedicationNotice(false);
    setPurchasedMedications([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 dark:bg-gray-900 dark:bg-opacity-90 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-900 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Paiement sécurisé</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Payment Methods */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
              Choisissez votre méthode de paiement
            </label>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`w-full p-4 border-2 rounded-lg transition-all ${
                    selectedMethod === method.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full ${method.color} flex items-center justify-center text-white text-lg`}>
                      {method.icon}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{method.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{method.description}</p>
                    </div>
                    {selectedMethod === method.id && (
                      <Check className="h-5 w-5 text-primary-600 ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Form */}
          {selectedMethod && (
            <div className="space-y-4">
              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Ex: 623 84 11 49"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Montant à débiter (GNF)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              {/* PIN Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Code secret (4 chiffres)
                </label>
                <input
                  type="password"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  maxLength="4"
                  placeholder="****"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-lg tracking-widest bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              {/* Payment Summary */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900 dark:text-gray-100">Total à payer:</span>
                  <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                    {formatPrice(amount)}
                  </span>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-300 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 dark:text-blue-100">
                      <strong>Paiement sécurisé:</strong> Vos informations sont protégées et le paiement est entièrement virtuel pour cette démonstration.
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={!phoneNumber || !amount || !pinCode || processing}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 dark:bg-primary-700 dark:hover:bg-primary-800 dark:disabled:bg-gray-700"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Traitement en cours...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    <span>Valider le paiement</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="bg-black bg-opacity-50 absolute inset-0"></div>
          <div className="bg-white dark:bg-gray-900 rounded-lg p-8 shadow-xl relative z-10 max-w-md mx-4 border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 dark:bg-green-900 rounded-full p-3">
                  <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Achat effectué avec succès !
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Votre paiement de {formatPrice(amount)} a été traité avec succès.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Cette fenêtre se fermera automatiquement dans quelques secondes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Medication Notice Modal */}
      {purchasedMedications.length > 0 && (
        <MedicationNoticeModal
          isOpen={showMedicationNotice}
          onClose={handleMedicationNoticeClose}
          medicationData={purchasedMedications[0]} // Afficher le premier médicament
        />
      )}
    </div>
  );
};

export default PaymentModal;
