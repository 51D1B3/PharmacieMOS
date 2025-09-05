import React, { useState, useEffect } from 'react';
import { Clock, Phone, MapPin, Calendar, Users, Award, ChevronRight, Heart, Shield, Star } from 'lucide-react';

const PharmacyWelcomeSection = ({ onShowPharmacyInfo, onShowPharmacyContact, onAppointmentClick }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredService, setHoveredService] = useState(null);

  // Images de pharmacie
  const pharmacyImages = [
    '/images/PHARMA_3.jpg',
    '/images/medecin-ethnique.jpg',
    '/images/pharmaciste-qui-organise-des-medicaments.jpg',
    '/images/vue-rapprochee-dune-main.jpg',
    '/images/armes-modernes.jpg',
    '/images/panier-medicament.jpg',
    '/images/deux-pharmaciens-afro-americains.jpg'
  ];

  const scrollingTexts = [
    "Profitez des fonctionnalités de notre pharmacie en ligne pour consulter nos horaires d'ouverture",
    "Envoyez votre consultation, prenez rendez-vous avec votre pharmacien et être au courant de nos actualités et promotions",
    "Une question ? Besoin d'un conseil ? Contactez-nous via la messagerie instantanée !",
    "Vous apporter des conseils personnalisés en Herboristerie, Contention médicale, Conseil dermatologique, Oncologie, Aromathérapie, Arrêt Tabac",
    "Vous mettre les meilleurs services à disposition : Préparation pilulier, Pharmacie engagée dans la démarche qualité, Parapharmacie, Pharmacie certifiée ISO 9001, Dépistage, Bilan de médication partagé",
    "Vous proposer des bons plans toute l'année : Retrait Prioritaire, Livraison dans la journée, Recevoir les promos, Promotions"
  ];

  const services = [
    {
      icon: Heart,
      title: "Conseils personnalisés",
      description: "Herboristerie, Contention médicale, Conseil dermatologique",
      color: "text-red-500",
      bgColor: "bg-red-50"
    },
    {
      icon: Shield,
      title: "Services de qualité",
      description: "Préparation pilulier, Pharmacie certifiée ISO 9001",
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      icon: Star,
      title: "Bons plans",
      description: "Retrait Prioritaire, Livraison dans la journée",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50"
    }
  ];

  // Fonction pour générer les horaires dynamiques de la semaine
  const generateWeekSchedule = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Lundi de cette semaine
    
    const days = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];
    const months = ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc'];
    
    return days.map((day, index) => {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + index);
      
      const dayNum = currentDate.getDate();
      const month = months[currentDate.getMonth()];
      
      return {
        day,
        date: `${dayNum} ${month}`,
        hours: index === 6 ? "fermé" : "08:00 - 22:00", // Dimanche fermé
        isClosed: index === 6
      };
    });
  };

  const scheduleData = generateWeekSchedule();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('pharmacy-welcome');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const textInterval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => 
        (prevIndex + 1) % scrollingTexts.length
      );
    }, 4000);

    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % pharmacyImages.length
      );
    }, 3000);

    return () => {
      clearInterval(textInterval);
      clearInterval(imageInterval);
    };
  }, [scrollingTexts.length, pharmacyImages.length]);

  return (
    <div 
      id="pharmacy-welcome"
      className={`mt-12 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      {/* Section principale avec image et contenu */}
      <div className="bg-gradient-to-br from-primary-50 via-white to-green-50 rounded-2xl shadow-lg overflow-hidden border border-primary-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Image avec overlay et carousel */}
          <div className="relative h-96 lg:h-[500px] overflow-hidden">
            <img
              src={pharmacyImages[currentImageIndex]}
              alt="Pharmacie MOS"
              className="w-full h-full object-cover transition-all duration-1000 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 via-transparent to-transparent"></div>
            
            {/* Éléments décoratifs flottants */}
            <div className="absolute top-4 right-4 animate-bounce">
              <div className="w-8 h-8 bg-yellow-400 rounded-full opacity-70"></div>
            </div>
            <div className="absolute bottom-8 left-8 animate-pulse">
              <div className="w-6 h-6 bg-green-400 rounded-full opacity-60"></div>
            </div>
            <div className="absolute top-1/2 right-8 animate-bounce delay-300">
              <div className="w-4 h-4 bg-blue-400 rounded-full opacity-50"></div>
            </div>
            
            {/* Indicateurs d'images */}
            <div className="absolute bottom-4 right-4 flex space-x-2">
              {pharmacyImages.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Contenu principal */}
          <div className="p-8 lg:p-10 flex flex-col justify-center">
            <div className="space-y-6">
              {/* Titre avec animation */}
              <div className="text-center lg:text-left">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  Bienvenue dans notre{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-green-600">
                    pharmacie
                  </span>
                </h2>
              </div>

              {/* Texte défilant avec animation */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-primary-100 min-h-[120px] flex items-center">
                <div className="w-full">
                  <p className="text-gray-700 leading-relaxed text-sm lg:text-base transition-all duration-500 ease-in-out">
                    {scrollingTexts[currentTextIndex]}
                  </p>
                  
                  {/* Indicateurs de progression */}
                  <div className="flex space-x-1 mt-3 justify-center lg:justify-start">
                    {scrollingTexts.map((_, index) => (
                      <div
                        key={index}
                        className={`h-1 rounded-full transition-all duration-300 ${
                          index === currentTextIndex 
                            ? 'w-8 bg-primary-600' 
                            : 'w-2 bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Services en grille */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {services.map((service, index) => {
                  const IconComponent = service.icon;
                  return (
                    <div
                      key={index}
                      className={`${service.bgColor} rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 border border-transparent hover:border-primary-200`}
                      onMouseEnter={() => setHoveredService(index)}
                      onMouseLeave={() => setHoveredService(null)}
                    >
                      <div className="flex flex-col items-center text-center space-y-2">
                        <IconComponent className={`h-6 w-6 ${service.color} transition-transform duration-300 ${hoveredService === index ? 'scale-110' : ''}`} />
                        <h4 className="font-medium text-gray-900 text-sm">{service.title}</h4>
                        <p className="text-xs text-gray-600 leading-tight">{service.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bouton d'action principal */}
              <div className="text-center lg:text-left">
                <button 
                  onClick={onShowPharmacyInfo}
                  className="group bg-gradient-to-r from-primary-600 to-green-600 hover:from-primary-700 hover:to-green-700 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2 mx-auto lg:mx-0"
                >
                  <span>En savoir plus</span>
                  <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section horaires avec design moderne - Agrandie */}
      <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-green-600 p-8">
          <h3 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Clock className="h-8 w-8" />
            <span>Nos horaires d'ouverture</span>
          </h3>
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
            {scheduleData.map((schedule, index) => (
              <div
                key={index}
                className={`text-center p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-md ${
                  schedule.isClosed
                    ? 'border-red-200 bg-red-50 hover:border-red-300'
                    : 'border-green-200 bg-green-50 hover:border-green-300 hover:-translate-y-1'
                }`}
              >
                <div className={`text-sm font-bold uppercase tracking-wide mb-1 ${
                  schedule.isClosed ? 'text-red-600' : 'text-green-600'
                }`}>
                  {schedule.day}
                </div>
                <div className="text-xs text-gray-600 mb-2">{schedule.date}</div>
                <div className={`text-sm font-medium ${
                  schedule.isClosed ? 'text-red-700' : 'text-gray-900'
                }`}>
                  {schedule.hours}
                </div>
                {!schedule.isClosed && (
                  <div className="mt-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mx-auto animate-pulse"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section équipe avec animations - Agrandie et centrée */}
      <div className="mt-8 flex justify-center">
        <div className="w-full max-w-6xl bg-gradient-to-br from-white via-primary-25 to-green-25 rounded-2xl shadow-lg border border-primary-100 overflow-hidden">
          <div className="p-12">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold text-gray-900 mb-6">Notre équipe s'engage à :</h3>
              <div className="w-32 h-2 bg-gradient-to-r from-primary-600 to-green-600 mx-auto rounded-full"></div>
            </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Service 1 */}
            <div className="group text-center p-6 rounded-xl bg-white/70 backdrop-blur-sm border border-primary-100 hover:border-primary-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Conseils personnalisés</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                en Herboristerie, Contention médicale, Conseil dermatologique, Oncologie, Aromathérapie, Arrêt Tabac
              </p>
              <div className="mt-4 flex justify-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>

            {/* Service 2 */}
            <div className="group text-center p-6 rounded-xl bg-white/70 backdrop-blur-sm border border-green-100 hover:border-green-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Meilleurs services</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Préparation pilulier, Pharmacie engagée dans la démarche qualité, Parapharmacie, Pharmacie certifiée ISO 9001, Dépistage, Bilan de médication partagé
              </p>
              <div className="mt-4">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                  Certifié ISO 9001
                </span>
              </div>
            </div>

            {/* Service 3 */}
            <div className="group text-center p-6 rounded-xl bg-white/70 backdrop-blur-sm border border-yellow-100 hover:border-yellow-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Bons plans toute l'année</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Retrait Prioritaire, Livraison dans la journée, Recevoir les promos, Promotions exclusives
              </p>
              <div className="mt-4">
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                  Jusqu'à -50%
                </span>
              </div>
            </div>
          </div>

          {/* Contact et informations */}
          <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-primary-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Horaires */}
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-primary-50 hover:bg-primary-100 transition-colors duration-300">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900">Ouverture</h5>
                  <p className="text-sm text-gray-600">Lun-Sam : 8h-22h</p>
                </div>
              </div>

              {/* Localisation */}
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors duration-300">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900">Localisation</h5>
                  <p className="text-sm text-gray-600">Madina Corniche</p>
                </div>
              </div>

              {/* Contact */}
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors duration-300">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900">Contact</h5>
                  <p className="text-sm text-gray-600">+224 623 84 11 49</p>
                </div>
              </div>
            </div>
          </div>

          {/* Boutons d'action interactifs */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onAppointmentClick}
              className="group bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2"
            >
              <Calendar className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
              <span>Prendre rendez-vous</span>
            </button>
            
            <button 
              onClick={onShowPharmacyContact}
              className="group bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2"
            >
              <Phone className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              <span>Nous contacter</span>
            </button>
            
            <button 
              onClick={onShowPharmacyInfo}
              className="group bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2"
            >
              <Heart className="h-5 w-5 transition-transform duration-300 group-hover:pulse" />
              <span>En savoir plus</span>
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Éléments décoratifs de fond */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-primary-200 to-transparent rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-tr from-green-200 to-transparent rounded-full opacity-20 animate-pulse delay-1000"></div>
      </div>
    </div>
  );
};

export default PharmacyWelcomeSection;
