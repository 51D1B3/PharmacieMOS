import React from 'react';
import { X, Clock, MapPin, Phone, Award, Users, Heart, Shield, Star } from 'lucide-react';

const PharmacyInfoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-4xl p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-green-600 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">À propos de PharmaMOS</h3>
              <button
                onClick={onClose}
                className="p-2 text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-blue-100 mt-2">Votre pharmacie de confiance à Madina Corniche</p>
          </div>

          <div className="p-6 max-h-96 overflow-y-auto">
            {/* Notre Mission */}
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Heart className="h-6 w-6 text-red-500 mr-2" />
                Notre Mission
              </h4>
              <p className="text-gray-700 leading-relaxed">
                PharmaMOS s'engage à fournir des soins pharmaceutiques de qualité supérieure à la communauté de Madina Corniche. 
                Nous mettons l'accent sur la sécurité, l'efficacité et l'accessibilité des médicaments pour tous nos patients.
              </p>
            </div>

            {/* Nos Services */}
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="h-6 w-6 text-blue-500 mr-2" />
                Nos Services Spécialisés
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-blue-900 mb-2">Conseils Personnalisés</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Herboristerie traditionnelle</li>
                    <li>• Contention médicale</li>
                    <li>• Conseil dermatologique</li>
                    <li>• Oncologie et soins palliatifs</li>
                    <li>• Aromathérapie</li>
                    <li>• Aide à l'arrêt du tabac</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-green-900 mb-2">Services Premium</h5>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Préparation de piluliers</li>
                    <li>• Pharmacie certifiée ISO 9001</li>
                    <li>• Parapharmacie complète</li>
                    <li>• Dépistage et tests rapides</li>
                    <li>• Bilan de médication partagé</li>
                    <li>• Suivi thérapeutique personnalisé</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Nos Avantages */}
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="h-6 w-6 text-yellow-500 mr-2" />
                Vos Avantages Client
              </h4>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-semibold text-yellow-900 mb-2">Services Rapides</h5>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• Retrait prioritaire</li>
                      <li>• Livraison dans la journée</li>
                      <li>• Commande en ligne 24h/24</li>
                      <li>• Réservation de médicaments</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold text-yellow-900 mb-2">Promotions</h5>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• Promotions exclusives</li>
                      <li>• Programme de fidélité</li>
                      <li>• Remises sur les génériques</li>
                      <li>• Offres saisonnières</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations Pratiques */}
            <div className="mb-6">
              <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-6 w-6 text-purple-500 mr-2" />
                Informations Pratiques
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <Clock className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                  <h5 className="font-semibold text-gray-900 mb-1">Horaires</h5>
                  <p className="text-sm text-gray-600">Lun-Sam: 8h-22h</p>
                  <p className="text-sm text-gray-600">Dimanche: Fermé</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <MapPin className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                  <h5 className="font-semibold text-gray-900 mb-1">Adresse</h5>
                  <p className="text-sm text-gray-600">Madina Corniche</p>
                  <p className="text-sm text-gray-600">Conakry, Guinée</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <Phone className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                  <h5 className="font-semibold text-gray-900 mb-1">Contact</h5>
                  <p className="text-sm text-gray-600">+224 623 84 11 49</p>
                  <p className="text-sm text-gray-600">Urgences 24h/24</p>
                </div>
              </div>
            </div>

            {/* Certification */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <Award className="h-8 w-8 text-blue-600" />
                <div>
                  <h5 className="font-semibold text-blue-900">Pharmacie Certifiée ISO 9001</h5>
                  <p className="text-sm text-blue-800">
                    Nous respectons les plus hauts standards de qualité et de sécurité pharmaceutique.
                    Notre équipe de pharmaciens qualifiés vous garantit des conseils professionnels et personnalisés.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyInfoModal;
