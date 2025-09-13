import React, { useState } from 'react';
import { X, Shield, Heart, AlertTriangle, CheckCircle, Info, Lightbulb, Users, Clock, Star } from 'lucide-react';

const ModernHealthTipsModal = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('general');

  if (!isOpen) return null;

  const categories = [
    { id: 'general', name: 'Conseils généraux', icon: Lightbulb, color: 'blue' },
    { id: 'medication', name: 'Médicaments', icon: Shield, color: 'green' },
    { id: 'emergency', name: 'Urgences', icon: AlertTriangle, color: 'red' },
    { id: 'prevention', name: 'Prévention', icon: Heart, color: 'purple' }
  ];

  const tips = {
    general: [
      {
        title: "Hydratation quotidienne",
        content: "Buvez au moins 1,5 à 2 litres d'eau par jour pour maintenir une bonne hydratation et favoriser l'élimination des toxines.",
        priority: "high",
        icon: CheckCircle
      },
      {
        title: "Sommeil réparateur",
        content: "Dormez 7 à 9 heures par nuit. Un sommeil de qualité renforce votre système immunitaire et améliore votre bien-être général.",
        priority: "high",
        icon: Clock
      },
      {
        title: "Activité physique régulière",
        content: "Pratiquez au moins 30 minutes d'activité physique modérée par jour pour maintenir votre forme et réduire les risques de maladies.",
        priority: "medium",
        icon: Heart
      },
      {
        title: "Alimentation équilibrée",
        content: "Consommez 5 fruits et légumes par jour, privilégiez les aliments riches en fibres et limitez les sucres raffinés.",
        priority: "high",
        icon: Star
      }
    ],
    medication: [
      {
        title: "Respect des posologies",
        content: "Respectez toujours les doses prescrites par votre médecin. Ne modifiez jamais un traitement sans avis médical.",
        priority: "critical",
        icon: AlertTriangle
      },
      {
        title: "Conservation des médicaments",
        content: "Stockez vos médicaments dans un endroit sec, à l'abri de la lumière et de la chaleur. Vérifiez régulièrement les dates de péremption.",
        priority: "high",
        icon: Shield
      },
      {
        title: "Interactions médicamenteuses",
        content: "Informez toujours votre pharmacien de tous les médicaments que vous prenez pour éviter les interactions dangereuses.",
        priority: "critical",
        icon: Info
      },
      {
        title: "Automédication prudente",
        content: "L'automédication doit rester occasionnelle et limitée. Consultez un professionnel de santé en cas de doute.",
        priority: "medium",
        icon: Lightbulb
      }
    ],
    emergency: [
      {
        title: "Numéros d'urgence",
        content: "En cas d'urgence médicale, composez le 15 (SAMU) ou le 112. Gardez ces numéros à portée de main.",
        priority: "critical",
        icon: AlertTriangle
      },
      {
        title: "Trousse de premiers secours",
        content: "Ayez toujours une trousse de premiers secours à domicile avec pansements, désinfectant, thermomètre et médicaments de base.",
        priority: "high",
        icon: Shield
      },
      {
        title: "Signes d'alerte",
        content: "Douleur thoracique, difficultés respiratoires, perte de conscience : consultez immédiatement un médecin.",
        priority: "critical",
        icon: Heart
      },
      {
        title: "Allergies sévères",
        content: "Si vous avez des allergies connues, portez toujours sur vous votre traitement d'urgence et informez votre entourage.",
        priority: "critical",
        icon: Info
      }
    ],
    prevention: [
      {
        title: "Hygiène des mains",
        content: "Lavez-vous les mains régulièrement avec du savon pendant au moins 20 secondes, surtout avant les repas.",
        priority: "high",
        icon: CheckCircle
      },
      {
        title: "Vaccinations à jour",
        content: "Maintenez vos vaccinations à jour selon le calendrier vaccinal. Consultez votre médecin pour un bilan.",
        priority: "high",
        icon: Shield
      },
      {
        title: "Dépistages réguliers",
        content: "Effectuez les dépistages recommandés selon votre âge et vos facteurs de risque (cholestérol, diabète, cancers).",
        priority: "medium",
        icon: Heart
      },
      {
        title: "Protection solaire",
        content: "Utilisez une crème solaire SPF 30+ minimum, portez des vêtements protecteurs et évitez l'exposition aux heures chaudes.",
        priority: "medium",
        icon: Star
      }
    ]
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-900/20';
      case 'high': return 'border-orange-500 bg-orange-900/20';
      case 'medium': return 'border-blue-500 bg-blue-900/20';
      default: return 'border-gray-500 bg-gray-900/20';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'critical': return 'Critique';
      case 'high': return 'Important';
      case 'medium': return 'Modéré';
      default: return 'Info';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white flex items-center">
            <Shield className="h-8 w-8 mr-3 text-green-400" />
            Conseils Santé & Sécurité
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar des catégories */}
          <div className="w-64 bg-gray-800 border-r border-gray-700 p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Catégories</h3>
            <div className="space-y-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3 ${
                      activeCategory === category.id
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{category.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Info box */}
            <div className="mt-6 bg-blue-900/30 border border-blue-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="h-5 w-5 text-blue-400" />
                <span className="text-blue-400 font-medium">Important</span>
              </div>
              <p className="text-blue-300 text-sm">
                Ces conseils ne remplacent pas un avis médical professionnel. 
                Consultez toujours votre médecin ou pharmacien.
              </p>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                {categories.find(cat => cat.id === activeCategory)?.name}
              </h3>
              <p className="text-gray-400">
                Découvrez nos conseils professionnels pour votre santé et sécurité
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tips[activeCategory]?.map((tip, index) => {
                const Icon = tip.icon;
                return (
                  <div
                    key={index}
                    className={`bg-gray-800 rounded-xl p-6 border-l-4 ${getPriorityColor(tip.priority)} hover:bg-gray-750 transition-colors`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="bg-gray-700 p-3 rounded-lg">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-semibold text-white">
                            {tip.title}
                          </h4>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            tip.priority === 'critical' ? 'bg-red-900 text-red-300' :
                            tip.priority === 'high' ? 'bg-orange-900 text-orange-300' :
                            'bg-blue-900 text-blue-300'
                          }`}>
                            {getPriorityLabel(tip.priority)}
                          </span>
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                          {tip.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Contact pharmacien */}
            <div className="mt-8 bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-700 rounded-xl p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-green-500/20 p-4 rounded-full">
                  <Users className="h-8 w-8 text-green-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-white mb-2">
                    Besoin de conseils personnalisés ?
                  </h4>
                  <p className="text-gray-300 mb-4">
                    Notre équipe de pharmaciens qualifiés est à votre disposition 
                    pour répondre à toutes vos questions de santé.
                  </p>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                    Contacter un pharmacien
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernHealthTipsModal;