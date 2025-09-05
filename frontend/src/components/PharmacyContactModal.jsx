import React from 'react';
import { X, Phone, Copy } from 'lucide-react';

const PharmacyContactModal = ({ isOpen, onClose }) => {
  const phoneNumber = "+224623841149";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(phoneNumber);
  };

  const callPharmacy = () => {
    window.location.href = `tel:${phoneNumber}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all duration-300 scale-100">
        {/* Header avec gradient */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm overflow-hidden">
                <img 
                  src="/images/LogoPharma.jpg" 
                  alt="Logo PharmaMOS"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold">PharmaMOS</h3>
                <p className="text-primary-100 text-sm">Contactez-nous directement</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-primary-100 transition-colors p-1"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-6">
          {/* Numéro de téléphone */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <Phone className="h-10 w-10 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Numéro de téléphone</h4>
            <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-200">
              <p className="text-2xl font-bold text-gray-900 mb-2">{phoneNumber}</p>
              <p className="text-sm text-gray-500">Disponible 24h/24 pour vos urgences</p>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="space-y-3">
            <button
              onClick={callPharmacy}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Phone className="h-5 w-5" />
              <span>Appeler maintenant</span>
            </button>
            
            <button
              onClick={copyToClipboard}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Copy className="h-5 w-5" />
              <span>Copier le numéro</span>
            </button>
          </div>

          {/* Informations supplémentaires */}
          <div className="text-center text-sm text-gray-500">
            <p>📍 Disponible pour consultations et urgences</p>
            <p>⏰ Service client disponible 7j/7</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyContactModal;
