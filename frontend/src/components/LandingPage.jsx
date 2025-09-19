import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Shield, 
  Clock, 
  Users, 
  Pill, 
  Stethoscope, 
  ChevronRight, 
  Star,
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Moon,
  Sun,
  Calendar,
  FileText,
  Award,
  TrendingUp
} from 'lucide-react';

const LandingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const isDarkMode = true; // Mode sombre permanent

  // Textes défilants pour la gestion de pharmacie
  const scrollingTexts = [
    "Ici, chaque client est un patient unique, et chaque soin est important.",
    "La confiance est notre ordonnance, la satisfaction votre guérison.",
    "Disponibles, à l’écoute et toujours proches de vous.", 
    "Conseils pharmaceutiques personnalisés",
    "Livraison rapide à domicile",
    "Ordonnances numériques acceptées, parce que votre bien-être n’attend pas, nous sommes là à tout moment.",
    "Paiement mobile sécurisé avec Orange Money & Mobile Money",
    "Service client 24h/7j disponible pour vous"
  ];

  // Images pour le carousel
  const carouselImages = [
    {
      url: "https://i.postimg.cc/W19V3Hyy/pharmacielogo.jpg",
      title: "Pharmacie Moderne Logo",
      description: "Technologie de pointe au service de votre santé"
    },
    {
      url: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", 
      title: "Médicaments de Qualité",
      description: "Produits pharmaceutiques certifiés et contrôlés"
    },
    {
      url: "https://i.postimg.cc/Bn5gBW3h/Smiling-pharmacist-Landing.jpg",
      title: "Pharmacien moderne",
      description: "Conseils d'un harmaciens qualifiés"
    }
  ];

  // Privilèges des clients
  const clientPrivileges = [
    {
      icon: <Pill className="h-8 w-8" />,
      title: "Catalogue Complet",
      description: "Accès à plus de 5000 médicaments et produits de santé"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Commande 24h/7j",
      description: "Passez vos commandes à tout moment, livraison rapide"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Sécurité Garantie",
      description: "Paiements sécurisés et données protégées"
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Suivi Personnalisé",
      description: "Historique médical et rappels de prise"
    },
    {
      icon: <Stethoscope className="h-8 w-8" />,
      title: "Conseils d'Experts",
      description: "Chat direct avec nos pharmaciens certifiés"
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Envoi de vos propres ordonnances",
      description: "Envoyez facilement vos ordonnances et recevez vos médicaments"
    }
  ];

  // Auto-rotation du carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotation des textes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % scrollingTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen transition-all duration-500 bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900">
      {/* Header */}
      <header className="backdrop-blur-md shadow-sm sticky top-0 z-50 transition-all duration-500 bg-gray-900/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img
                src="/images/mon_logo.png"
                alt="PharmaMOS Logo"
                className="h-14 w-14 rounded-full object-cover border-2 border-primary-500 shadow"
              />
              <span className="text-2xl font-bold transition-colors duration-300 text-white">PharmaMOS</span>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="px-6 py-2 bg-white text-gray-900 hover:bg-gray-100 font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section avec Carousel */}
      <section className="relative h-screen overflow-hidden">
        {/* Background Carousel */}
        <div className="absolute inset-0">
          {carouselImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fadeInUp">
              Bienvenue chez <span className="text-primary-400">PharmaMOS</span>
            </h1>
            
            {/* Texte défilant */}
            <div className="h-16 mb-8 flex items-center justify-center">
              <p className="text-xl md:text-2xl font-light animate-pulse">
                {scrollingTexts[currentTextIndex]}
              </p>
            </div>

            <p className="text-lg md:text-xl mb-8 opacity-90 animate-slideInRight">
              Votre pharmacie digitale de confiance - Gestion moderne, service d'excellence
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center space-x-2"
              >
                <span>Commencer maintenant</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/about"
                className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold rounded-lg transition-all duration-300 inline-block text-center"
              >
                En savoir plus
              </Link>
            </div>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Section Objectifs Business */}
      <section className="py-20 transition-all duration-500 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 transition-colors duration-300 text-white">
              Nos Objectifs pour Votre Santé
            </h2>
            <p className="text-xl max-w-3xl mx-auto transition-colors duration-300 text-gray-300">
              Trois piliers fondamentaux pour révolutionner votre expérience pharmaceutique
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Attirer Nouveaux Clients */}
            <div className="group relative">
              <div className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:scale-105 border border-teal-500/30">
                <div className="relative mb-6">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-teal-400/50 transition-all duration-300">
                    <div className="relative">
                      <Users className="h-12 w-12 text-white" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">+</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-teal-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 text-center group-hover:text-teal-300 transition-colors">
                  ATTIRER NOUVEAUX
                </h3>
                <h4 className="text-xl font-semibold text-teal-300 mb-4 text-center">
                  PATIENTS
                </h4>
                <p className="text-gray-300 text-center leading-relaxed">
                  Interface moderne et services innovants pour séduire une nouvelle clientèle soucieuse de sa santé
                </p>
                <div className="mt-6 flex justify-center">
                  <div className="w-12 h-1 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full group-hover:w-16 transition-all duration-300"></div>
                </div>
              </div>
            </div>

            {/* Augmenter Efficacité */}
            <div className="group relative">
              <div className="bg-gradient-to-br from-rose-500/20 to-pink-500/20 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:scale-105 border border-rose-500/30">
                <div className="relative mb-6">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-r from-rose-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-rose-400/50 transition-all duration-300">
                    <div className="relative">
                      <div className="w-8 h-8 border-4 border-white rounded-full relative">
                        <Clock className="h-6 w-6 text-white absolute -top-1 -left-1" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-rose-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 text-center group-hover:text-rose-300 transition-colors">
                  AUGMENTER
                </h3>
                <h4 className="text-xl font-semibold text-rose-300 mb-4 text-center">
                  EFFICACITÉ
                </h4>
                <p className="text-gray-300 text-center leading-relaxed">
                  Optimisation des processus et automatisation pour un service plus rapide et précis
                </p>
                <div className="mt-6 flex justify-center">
                  <div className="w-12 h-1 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full group-hover:w-16 transition-all duration-300"></div>
                </div>
              </div>
            </div>

            {/* Développer Activité */}
            <div className="group relative">
              <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:scale-105 border border-emerald-500/30">
                <div className="relative mb-6">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-r from-emerald-400 to-green-400 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-emerald-400/50 transition-all duration-300">
                    <div className="relative">
                      <TrendingUp className="h-12 w-12 text-white" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-900">📊</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 text-center group-hover:text-emerald-300 transition-colors">
                  DÉVELOPPER
                </h3>
                <h4 className="text-xl font-semibold text-emerald-300 mb-4 text-center">
                  ACTIVITÉ
                </h4>
                <p className="text-gray-300 text-center leading-relaxed">
                  Expansion des services et croissance durable pour une pharmacie prospère
                </p>
                <div className="mt-6 flex justify-center">
                  <div className="w-12 h-1 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full group-hover:w-16 transition-all duration-300"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privilèges des Clients */}
      <section className="py-20 transition-all duration-500 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 transition-colors duration-300 text-white">
              Vos Privilèges Client
            </h2>
            <p className="text-xl max-w-3xl mx-auto transition-colors duration-300 text-gray-300">
              Découvrez tous les avantages exclusifs que vous obtiendrez en rejoignant notre plateforme
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {clientPrivileges.map((privilege, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group bg-gradient-to-br from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500"
              >
                <div className="text-primary-600 mb-4 group-hover:scale-110 transition-transform">
                  {privilege.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 transition-colors duration-300 text-white">
                  {privilege.title}
                </h3>
                <p className="leading-relaxed transition-colors duration-300 text-gray-300">
                  {privilege.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Statistiques */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-white">
            <div className="animate-float">
              <div className="text-4xl font-bold mb-2">5000+</div>
              <div className="text-primary-100">Médicaments disponibles</div>
            </div>
            <div className="animate-float animation-delay-2000">
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-primary-100">Clients satisfaits</div>
            </div>
            <div className="animate-float animation-delay-4000">
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-primary-100">Service disponible</div>
            </div>
            <div className="animate-float">
              <div className="text-4xl font-bold mb-2">99%</div>
              <div className="text-primary-100">Taux de satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Années d'Expérience */}
      <section className="py-20 transition-all duration-500 bg-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 transition-colors duration-300 text-white">
              Notre Expérience à Votre Service
            </h2>
            <p className="text-xl max-w-3xl mx-auto transition-colors duration-300 text-gray-300">
              Plus de 15 années d'excellence dans le domaine pharmaceutique
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="p-8 rounded-2xl shadow-xl transition-all duration-500 bg-gray-800">
              <div className="text-center mb-8">
                <div className={`text-8xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent`}>
                  15+
                </div>
                <h3 className="text-2xl font-semibold mb-4 transition-colors duration-300 text-white">
                  Années d'Expérience
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Award className="h-6 w-6 text-primary-600" />
                  <span className="transition-colors duration-300 text-gray-300">Pharmaciens certifiés et expérimentés</span>
                </div>
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-6 w-6 text-primary-600" />
                  <span className="transition-colors duration-300 text-gray-300">Innovation continue dans les services</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-6 w-6 text-primary-600" />
                  <span className="transition-colors duration-300 text-gray-300">Conformité aux normes internationales</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-xl shadow-lg transition-all duration-500 bg-gray-800">
                <div className="flex items-center space-x-4 mb-4">
                  <Calendar className="h-8 w-8 text-primary-600" />
                  <h4 className="text-lg font-semibold transition-colors duration-300 text-white">Actualités Pharmaceutiques</h4>
                </div>
                <p className="transition-colors duration-300 text-gray-300">
                  Restez informé des dernières innovations et recommandations en matière de santé.
                </p>
              </div>
              
              <div className="p-6 rounded-xl shadow-lg transition-all duration-500 bg-gray-800">
                <div className="flex items-center space-x-4 mb-4">
                  <FileText className="h-8 w-8 text-primary-600" />
                  <h4 className="text-lg font-semibold transition-colors duration-300 text-white">Conseils Santé</h4>
                </div>
                <p className="transition-colors duration-300 text-gray-300">
                  Bénéficiez de conseils personnalisés de nos experts pour optimiser votre bien-être.
                </p>
              </div>
              
              <div className="p-6 rounded-xl shadow-lg transition-all duration-500 bg-gray-800">
                <div className="flex items-center space-x-4 mb-4">
                  <Heart className="h-8 w-8 text-primary-600" />
                  <h4 className="text-lg font-semibold transition-colors duration-300 text-white">Suivi Personnalisé</h4>
                </div>
                <p className="transition-colors duration-300 text-gray-300">
                  Un accompagnement sur mesure pour chaque patient, adapté à vos besoins spécifiques.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-white py-16 transition-all duration-500 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Logo et Description */}
            <div className="col-span-1 md:col-span-2">
              <button 
                onClick={() => window.location.reload()}
                className="flex items-center space-x-3 mb-4 hover:opacity-80 transition-opacity"
              >
                <img
                  src="/images/mon_logo.png"
                  alt="PharmaMOS Logo"
                  className="h-10 w-10 rounded-full object-cover border-2 border-primary-500"
                />
                <span className="text-2xl font-bold">PharmaMOS</span>
              </button>
              <p className="text-gray-300 mb-6 leading-relaxed">
                PharmaMOS révolutionne la gestion pharmaceutique avec une plateforme moderne, 
                sécurisée et accessible 24h/7j. Votre santé, notre priorité.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 p-3 rounded-full hover:bg-blue-700 transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-400 p-3 rounded-full hover:bg-blue-500 transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-pink-600 p-3 rounded-full hover:bg-pink-700 transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4" />
                  <span>+224 623 841 149</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4" />
                  <span>mahamadsidiboss@gmail.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4" />
                  <span>Madina, Conakry, Guinée</span>
                </div>
              </div>
            </div>

            {/* Partenaires */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Partenaires</h3>
              <div className="space-y-2 text-gray-300">
                <div>Orange Money</div>
                <div>Mobile Money</div>
                <div>Ministère de la Santé</div>
                <div>Ordre des Pharmaciens</div>
              </div>
            </div>
          </div>

          {/* Signatures et Copyright */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 mb-4 md:mb-0">
                <p>&copy; 2025 PharmaMOS. Tous droits réservés.</p>
                <p className="text-sm">Développé avec ❤️ pour la santé en Guinée</p>
              </div>
              <div className="flex space-x-6 text-sm text-gray-400">
                <Link to="/privacy-policy" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors">Politique de confidentialité</Link>
                <Link to="/terms-of-service" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors">Conditions d'utilisation</Link>
                <Link to="/support" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors">Support</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
