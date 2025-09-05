import React, { useState, useEffect } from 'react';
import { Heart, Shield, Star, TrendingUp, Clock, MapPin, Phone } from 'lucide-react';

const HeroSection = ({ user, onShowServices, onShowHealthTips, onShowPharmacyContact }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "Bienvenue sur PharmaMOS",
      subtitle: "Votre pharmacie en ligne de confiance",
      description: "Commandez vos médicaments en ligne et récupérez-les en pharmacie. Service rapide et sécurisé.",
      cta: "Découvrir le catalogue",
      secondaryCta: "Nos services",
      bgColor: "from-primary-600 via-primary-700 to-primary-800",
      icon: Heart
    },
    {
      id: 2,
      title: "Promotion spéciale",
      subtitle: "-20% sur tous les vitamines",
      description: "Profitez de nos réductions exceptionnelles sur une large gamme de vitamines et compléments alimentaires.",
      cta: "Voir les promos",
      secondaryCta: "Tous les produits",
      bgColor: "from-green-600 via-green-700 to-green-800",
      icon: Star
    },
    {
      id: 3,
      title: "Conseils santé",
      subtitle: "Restez informé",
      description: "Découvrez nos conseils santé et bien-être pour prendre soin de vous et de votre famille.",
      cta: "Lire les conseils",
      secondaryCta: "Nous contacter",
      bgColor: "from-blue-600 via-blue-700 to-blue-800",
      icon: Shield
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const currentSlideData = slides[currentSlide];

  return (
    <div className="relative overflow-hidden rounded-xl mb-8">
      {/* Main Hero */}
      <div className={`bg-gradient-to-r ${currentSlideData.bgColor} p-8 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black opacity-10"></div>
        
        {/* Floating elements */}
        <div className="absolute top-4 right-4 bg-white bg-opacity-20 rounded-full p-3 animate-pulse">
          <currentSlideData.icon className="h-6 w-6 text-white" />
        </div>
        <div className="absolute bottom-4 left-4 bg-white bg-opacity-20 rounded-full p-3 animate-bounce">
          <Star className="h-6 w-6 text-white" />
        </div>
        <div className="absolute top-1/2 right-8 transform -translate-y-1/2 bg-white bg-opacity-10 rounded-full p-4 animate-pulse">
          <TrendingUp className="h-8 w-8 text-white" />
        </div>

        <div className="relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {currentSlideData.title}
            </h2>
            <p className="text-xl md:text-2xl text-primary-100 mb-2">
              {currentSlideData.subtitle}
            </p>
            <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
              {currentSlideData.description}
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={currentSlideData.cta === "Lire les conseils" ? onShowHealthTips : undefined}
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-lg transform hover:scale-105"
              >
                {currentSlideData.cta}
              </button>
              <button 
                onClick={currentSlideData.secondaryCta === "Nous contacter" ? onShowPharmacyContact : currentSlideData.secondaryCta === "Nos services" ? onShowServices : undefined}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-primary-600 transition-colors"
              >
                {currentSlideData.secondaryCta}
              </button>
            </div>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-100 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Ouverture</h4>
              <p className="text-sm text-gray-500">Lun-Sam: 8h-22h</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <MapPin className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Localisation</h4>
              <p className="text-sm text-gray-500">Madina Corniche</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Phone className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Contact</h4>
              <p className="text-sm text-gray-500">+224623841149</p>
            </div>
          </div>
        </div>
      </div>

      {/* Health Tips Banner */}
      <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="bg-yellow-100 p-2 rounded-lg">
            <Shield className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-yellow-900">Conseil santé du jour</h4>
            <p className="text-sm text-yellow-800">
              N'oubliez pas de boire au moins 1,5L d'eau par jour pour maintenir une bonne hydratation !
            </p>
          </div>
          <button
            onClick={onShowHealthTips}
            className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
          >
            Plus de conseils →
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
