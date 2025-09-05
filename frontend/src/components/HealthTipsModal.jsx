import React, { useState, useEffect } from 'react';
import { X, Heart, Shield, Pill, Activity } from 'lucide-react';

const HealthTipsModal = ({ isOpen, onClose }) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  
  console.log('HealthTipsModal rendered with isOpen:', isOpen);

  const healthTips = [
    {
      emoji: "🥗",
      title: "Mangez équilibré",
      content: "Privilégiez les fruits, légumes, céréales complètes et limitez les excès de sucre, sel et graisses.",
      color: "from-green-500 to-emerald-600"
    },
    {
      emoji: "💧",
      title: "Hydratez-vous bien",
      content: "Buvez suffisamment d'eau chaque jour (environ 1,5 à 2 L pour un adulte).",
      color: "from-blue-500 to-cyan-600"
    },
    {
      emoji: "🏃",
      title: "Faites de l'activité physique",
      content: "Au moins 30 minutes par jour (marche, sport, vélo).",
      color: "from-orange-500 to-red-600"
    },
    {
      emoji: "😴",
      title: "Dormez suffisamment",
      content: "Un bon sommeil (7 à 8h par nuit) est vital pour la récupération.",
      color: "from-purple-500 to-indigo-600"
    },
    {
      emoji: "🚭",
      title: "Évitez le tabac et l'alcool excessif",
      content: "Ils augmentent fortement les risques de maladies.",
      color: "from-red-500 to-pink-600"
    },
    {
      emoji: "✋",
      title: "Lavez-vous régulièrement les mains",
      content: "Simple mais essentiel pour prévenir les infections.",
      color: "from-teal-500 to-green-600"
    },
    {
      emoji: "😁",
      title: "Protégez vos dents",
      content: "Brossage 2 fois/jour + visite régulière chez le dentiste.",
      color: "from-yellow-500 to-orange-600"
    },
    {
      emoji: "☀️",
      title: "Protégez votre peau",
      content: "Évitez l'exposition excessive au soleil, utilisez une protection solaire.",
      color: "from-amber-500 to-yellow-600"
    },
    {
      emoji: "🩺",
      title: "Faites des bilans de santé réguliers",
      content: "Dépistage, tension artérielle, glycémie, cholestérol.",
      color: "from-blue-600 to-indigo-700"
    },
    {
      emoji: "🧘",
      title: "Préservez votre santé mentale",
      content: "Prenez du temps pour vous, gérez le stress, parlez si vous ne vous sentez pas bien.",
      color: "from-violet-500 to-purple-600"
    }
  ];

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setCurrentTipIndex((prevIndex) => 
        (prevIndex + 1) % healthTips.length
      );
    }, 5000); // Change de conseil toutes les 5 secondes

    return () => clearInterval(interval);
  }, [isOpen, healthTips.length]);

  if (!isOpen) return null;

  const currentTip = healthTips[currentTipIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden transform transition-all duration-300 scale-100">
        {/* Header avec gradient */}
        <div className={`bg-gradient-to-r ${currentTip.color} p-6 text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="text-4xl bg-white bg-opacity-30 rounded-full w-16 h-16 flex items-center justify-center backdrop-blur-sm transform translate-y-4">
                {currentTip.emoji}
              </div>
              <div>
                <h3 className="text-xl font-bold">Conseils Santé</h3>
                <p className="text-white text-opacity-90 text-sm">Votre bien-être, notre priorité</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="p-8 pt-12">
          <div className="text-center mb-8">
            <h4 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
              {currentTip.title}
            </h4>
            <div className="w-16 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full mx-auto mb-6"></div>
            <p className="text-gray-700 leading-relaxed text-lg">
              {currentTip.content}
            </p>
          </div>

          {/* Navigation interactive */}
          <div className="flex justify-center items-center space-x-4 mb-6">
            <button
              onClick={() => setCurrentTipIndex((prev) => (prev - 1 + healthTips.length) % healthTips.length)}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Indicateurs de progression améliorés */}
            <div className="flex space-x-2">
              {healthTips.map((tip, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTipIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTipIndex 
                      ? `bg-gradient-to-r ${tip.color} scale-125 shadow-lg` 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={() => setCurrentTipIndex((prev) => (prev + 1) % healthTips.length)}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Message statique à gauche */}
          <div className="text-left mb-8 mt-6">
            <p className="text-lg font-medium text-gray-700 italic pl-4 border-l-4 border-primary-300">
              Prenez soin de vous, chaque jour.
            </p>
          </div>

          {/* Footer informatif */}
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-sm text-gray-600 mb-2">
              Conseil <span className="font-semibold text-primary-600">{currentTipIndex + 1}</span> sur {healthTips.length}
            </div>
            <div className="flex justify-center items-center space-x-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Transition automatique toutes les 5 secondes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthTipsModal;
