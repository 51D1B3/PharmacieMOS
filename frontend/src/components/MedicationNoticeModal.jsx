import React from 'react';
import { X, Clock, Pill, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

const MedicationNoticeModal = ({ isOpen, onClose, medicationData }) => {
  if (!isOpen || !medicationData) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-green-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Pill className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Notice Médicament</h2>
              <p className="text-primary-100">Informations importantes sur votre achat</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Alert Banner */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-orange-800 mb-1">Ceci est un médicament sans ordonnance</h3>
              <p className="text-sm text-orange-700">
                Assurez-vous d'avoir bien lu la notice ci-dessous avant de commander ce médicament.
              </p>
            </div>
          </div>

          {/* Medication Info */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              Informations sur votre achat
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                <Pill className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-sm text-gray-600">Médicament</p>
                  <p className="font-semibold text-gray-900">{medicationData.name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                <Calendar className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Date d'achat</p>
                  <p className="font-semibold text-gray-900">{formatDate(medicationData.purchaseDate)}</p>
                </div>
              </div>
              
              {medicationData.dosage && (
                <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border md:col-span-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Dosage recommandé</p>
                    <p className="font-semibold text-gray-900">{medicationData.dosage}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notice Content */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">NOTICE</h3>
              <div className="text-sm text-orange-600 font-medium">
                ANSM - Mis à jour le : {new Date().toLocaleDateString('fr-FR')}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-2 border-b border-gray-200 pb-1">
                  Dénomination du médicament
                </h4>
                <p className="text-center font-semibold text-lg text-primary-700">
                  {medicationData.name}
                </p>
                {medicationData.activeIngredient && (
                  <p className="text-center text-gray-600 mt-1">{medicationData.activeIngredient}</p>
                )}
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                  Encadré
                </h4>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-gray-800 leading-relaxed mb-3">
                    <strong>Veuillez lire attentivement cette notice avant d'utiliser ce médicament car elle contient des informations importantes pour vous.</strong>
                  </p>
                  <p className="text-sm text-gray-800 mb-2">
                    Vous devez toujours utiliser ce médicament en suivant scrupuleusement les informations fournies dans cette notice ou par votre médecin ou votre pharmacien.
                  </p>
                  <ul className="text-sm text-gray-800 space-y-1 ml-4">
                    <li>• Gardez cette notice. Vous pourriez avoir besoin de la relire.</li>
                    <li>• Adressez-vous à votre pharmacien pour tout conseil ou information.</li>
                    <li>• Si vous ressentez l'un des effets indésirables, parlez-en à votre médecin ou votre pharmacien.</li>
                    <li>• Vous devez vous adresser à votre médecin si vous ne ressentez aucune amélioration ou si vous vous sentez moins bien après la période de traitement indiquée dans cette notice.</li>
                  </ul>
                </div>
              </div>

              {medicationData.instructions && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                    Mode d'emploi et posologie
                  </h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-gray-800">{medicationData.instructions}</p>
                  </div>
                </div>
              )}

              {medicationData.sideEffects && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                    Effets indésirables possibles
                  </h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-gray-800">{medicationData.sideEffects}</p>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-bold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                  Conservation
                </h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-800">
                    Tenir ce médicament hors de la vue et de la portée des enfants. 
                    Conserver à température ambiante (15-25°C) dans un endroit sec et à l'abri de la lumière.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-primary-600 to-green-600 hover:from-primary-700 hover:to-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2"
            >
              <CheckCircle className="h-5 w-5" />
              <span>J'ai lu et compris</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationNoticeModal;
