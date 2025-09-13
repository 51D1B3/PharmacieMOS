import React, { useState } from 'react';
import { X, Shield, Heart, AlertTriangle, CheckCircle, Info, Lightbulb, Users, Clock } from 'lucide-react';

const PromoPage = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white flex items-center">
            <Gift className="h-8 w-8 mr-3 text-yellow-400" />
            Promotions & Offres Spéciales
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Message principal */}
          <div className="text-center bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-700 rounded-2xl p-8">
            <div className="flex justify-center mb-6">
              <div className="bg-yellow-500/20 p-4 rounded-full">
                <Star className="h-12 w-12 text-yellow-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Aucune promotion disponible actuellement
            </h3>
            <p className="text-gray-300 text-lg mb-6">
              Nous préparons des offres exceptionnelles pour vous ! 
              Restez connecté pour ne rien manquer de nos prochaines promotions.
            </p>
            <div className="flex items-center justify-center space-x-2 text-yellow-400">
              <Bell className="h-5 w-5" />
              <span className="font-medium">Vous serez notifié dès qu'une promotion sera disponible</span>
            </div>
          </div>

          {/* Prochaines promotions */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h4 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Calendar className="h-6 w-6 mr-2 text-blue-400" />
              Promotions à venir
            </h4>
            <div className="space-y-4">
              <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-blue-500">
                <h5 className="font-medium text-white mb-2">Semaine de la santé</h5>
                <p className="text-gray-300 text-sm mb-2">
                  -15% sur tous les produits de parapharmacie et vitamines
                </p>
                <p className="text-blue-400 text-xs">Prévue pour le mois prochain</p>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-green-500">
                <h5 className="font-medium text-white mb-2">Offre fidélité</h5>
                <p className="text-gray-300 text-sm mb-2">
                  Réductions progressives selon vos achats
                </p>
                <p className="text-green-400 text-xs">En cours de préparation</p>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-purple-500">
                <h5 className="font-medium text-white mb-2">Promotion saisonnière</h5>
                <p className="text-gray-300 text-sm mb-2">
                  Offres spéciales sur les produits de saison
                </p>
                <p className="text-purple-400 text-xs">Bientôt disponible</p>
              </div>
            </div>
          </div>

          {/* Comment être notifié */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h4 className="text-xl font-semibold text-white mb-4">
              Comment être informé des promotions ?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Bell className="h-6 w-6 text-yellow-400" />
                  <h5 className="font-medium text-white">Notifications push</h5>
                </div>
                <p className="text-gray-300 text-sm">
                  Activez les notifications dans vos paramètres pour recevoir 
                  les alertes promotions en temps réel.
                </p>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Star className="h-6 w-6 text-blue-400" />
                  <h5 className="font-medium text-white">Programme fidélité</h5>
                </div>
                <p className="text-gray-300 text-sm">
                  Rejoignez notre programme de fidélité pour bénéficier 
                  d'offres exclusives et personnalisées.
                </p>
              </div>
            </div>
          </div>

          {/* Avantages clients */}
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700 rounded-xl p-6">
            <h4 className="text-xl font-semibold text-white mb-4">
              Vos avantages PharmaMOS
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="bg-blue-500/20 p-3 rounded-full w-fit mx-auto mb-3">
                  <Gift className="h-6 w-6 text-blue-400" />
                </div>
                <h5 className="font-medium text-white mb-2">Offres exclusives</h5>
                <p className="text-gray-300 text-sm">
                  Promotions réservées aux clients fidèles
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-500/20 p-3 rounded-full w-fit mx-auto mb-3">
                  <Star className="h-6 w-6 text-green-400" />
                </div>
                <h5 className="font-medium text-white mb-2">Points fidélité</h5>
                <p className="text-gray-300 text-sm">
                  Cumulez des points à chaque achat
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-500/20 p-3 rounded-full w-fit mx-auto mb-3">
                  <Bell className="h-6 w-6 text-purple-400" />
                </div>
                <h5 className="font-medium text-white mb-2">Alertes personnalisées</h5>
                <p className="text-gray-300 text-sm">
                  Notifications sur vos produits préférés
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoPage;