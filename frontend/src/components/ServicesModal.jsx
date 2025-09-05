import React, { useState } from 'react';
import { X, Pill, Stethoscope, Clock, Shield, Heart, Phone, Calendar, Truck, Users } from 'lucide-react';

const ServicesModal = ({ isOpen, onClose }) => {
  const [activeService, setActiveService] = useState(0);

  const services = [
    {
      id: 1,
      icon: Pill,
      title: "Médicaments sur ordonnance",
      description: "Dispensation de médicaments prescrits par votre médecin",
      details: [
        "Vérification et validation des ordonnances",
        "Conseil pharmaceutique personnalisé",
        "Suivi des interactions médicamenteuses",
        "Gestion des traitements chroniques",
        "Disponibilité 7j/7 pour les urgences"
      ],
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      id: 2,
      icon: Heart,
      title: "Médicaments sans ordonnance",
      description: "Large gamme de produits de santé en libre accès",
      details: [
        "Antidouleurs et anti-inflammatoires",
        "Produits pour rhume et grippe",
        "Vitamines et compléments alimentaires",
        "Produits de premiers secours",
        "Conseil pour l'automédication responsable"
      ],
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      id: 3,
      icon: Stethoscope,
      title: "Consultations pharmaceutiques",
      description: "Conseils professionnels et accompagnement santé",
      details: [
        "Entretiens pharmaceutiques personnalisés",
        "Conseils en hygiène et prévention",
        "Orientation vers les professionnels de santé",
        "Suivi des effets secondaires",
        "Éducation thérapeutique du patient"
      ],
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      id: 4,
      icon: Clock,
      title: "Service d'urgence 24h/24",
      description: "Disponibilité continue pour vos besoins urgents",
      details: [
        "PharmaMOS de garde les week-ends",
        "Service d'urgence nocturne",
        "Livraison express en cas d'urgence",
        "Hotline pharmaceutique 24h/24",
        "Prise en charge des urgences médicamenteuses"
      ],
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      textColor: "text-red-600"
    },
    {
      id: 5,
      icon: Truck,
      title: "Livraison à domicile",
      description: "Service de livraison rapide et sécurisé",
      details: [
        "Livraison dans un rayon de 10km",
        "Respect de la chaîne du froid",
        "Livraison express en moins de 2h",
        "Service gratuit pour les personnes âgées",
        "Suivi en temps réel de votre commande"
      ],
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    },
    {
      id: 6,
      icon: Shield,
      title: "Préparations magistrales",
      description: "Préparations personnalisées selon prescription",
      details: [
        "Gélules et capsules sur mesure",
        "Crèmes et pommades personnalisées",
        "Préparations pédiatriques adaptées",
        "Dosages spécifiques non commercialisés",
        "Contrôle qualité rigoureux"
      ],
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600"
    }
  ];

  if (!isOpen) return null;

  const currentService = services[activeService];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 overflow-hidden transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`bg-gradient-to-r ${currentService.color} p-6 text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <currentService.icon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Nos Services</h3>
                <p className="text-white text-opacity-90">PharmaMOS - À votre service</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Sidebar - Liste des services */}
          <div className="lg:w-1/3 bg-gray-50 p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Tous nos services</h4>
            <div className="space-y-2">
              {services.map((service, index) => (
                <button
                  key={service.id}
                  onClick={() => setActiveService(index)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                    activeService === index
                      ? `${service.bgColor} ${service.textColor} shadow-md`
                      : 'hover:bg-white hover:shadow-sm text-gray-700'
                  }`}
                >
                  <service.icon className={`h-5 w-5 ${activeService === index ? service.textColor : 'text-gray-500'}`} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{service.title}</p>
                    <p className="text-xs opacity-75 mt-1">{service.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Contenu principal */}
          <div className="lg:w-2/3 p-6">
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-12 h-12 ${currentService.bgColor} rounded-full flex items-center justify-center`}>
                  <currentService.icon className={`h-6 w-6 ${currentService.textColor}`} />
                </div>
                <div>
                  <h5 className="text-xl font-bold text-gray-900">{currentService.title}</h5>
                  <p className="text-gray-600">{currentService.description}</p>
                </div>
              </div>
            </div>

            {/* Détails du service */}
            <div className="space-y-4">
              <h6 className="font-semibold text-gray-900 mb-3">Détails du service :</h6>
              <div className="grid gap-3">
                {currentService.details.map((detail, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 ${currentService.bgColor} rounded-full mt-2 flex-shrink-0`}></div>
                    <p className="text-gray-700 text-sm leading-relaxed">{detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button className={`flex-1 bg-gradient-to-r ${currentService.color} text-white font-medium py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2`}>
                <Phone className="h-5 w-5" />
                <span>Nous contacter</span>
              </button>
              <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Prendre RDV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>Plus de 10 ans d'expérience à votre service</span>
            </div>
            <div className="text-sm text-gray-500">
              📞 +224 623 84 11 49 | 🕐 Ouvert 7j/7 de 8h à 22h
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesModal;
