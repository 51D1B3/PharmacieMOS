import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Shield, 
  Users, 
  Award, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Phone, 
  Mail,
  CheckCircle,
  Star,
  ArrowLeft,
  Target,
  Lightbulb,
  Globe
} from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900">
      {/* Header */}
      <header className="bg-gray-900/90 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-full p-2 shadow-lg">
                <img 
                  src="/images/mon_logo.png" 
                  alt="PharmaMOS Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-2xl font-bold text-white">PharmaMOS</span>
            </div>
            <Link
              to="/"
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Retour</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-bold text-white mb-6">
            À Propos de <span className="text-primary-400">PharmaMOS</span>
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            Votre pharmacie moderne, proche de vous et de vos besoins
          </p>
        </div>
      </section>

      {/* Présentation Générale */}
      <section className="py-16 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Notre Histoire</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                PharmaMOS est né de la vision de révolutionner l'accès aux soins pharmaceutiques 
                en Guinée. Créé par une équipe de professionnels passionnés, notre projet vise à 
                améliorer l'accès aux soins et fournir des médicaments de qualité à tous.
              </p>
              <div className="bg-gradient-to-r from-primary-600/20 to-blue-600/20 p-6 rounded-xl border border-primary-500/30">
                <h3 className="text-xl font-semibold text-primary-300 mb-3">Notre Mission</h3>
                <p className="text-gray-300">
                  Démocratiser l'accès aux soins pharmaceutiques grâce à la technologie, 
                  tout en maintenant la qualité et la proximité humaine qui caractérisent 
                  une pharmacie de confiance.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-500/20 to-blue-500/20 p-8 rounded-2xl">
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-primary-400">15+</div>
                    <div className="text-gray-300">Années d'expérience</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary-400">5000+</div>
                    <div className="text-gray-300">Médicaments</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary-400">10K+</div>
                    <div className="text-gray-300">Clients satisfaits</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary-400">24/7</div>
                    <div className="text-gray-300">Service disponible</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valeurs et Engagements */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Nos Valeurs & Engagements</h2>
            <p className="text-gray-300 text-lg">Les principes qui guident chacune de nos actions</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Qualité",
                description: "Médicaments certifiés et respect strict des normes pharmaceutiques"
              },
              {
                icon: <Heart className="h-8 w-8" />,
                title: "Accessibilité", 
                description: "Prix abordables et proximité pour tous nos patients"
              },
              {
                icon: <CheckCircle className="h-8 w-8" />,
                title: "Confiance",
                description: "Transparence, sécurité et traçabilité dans tous nos services"
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "Service Client",
                description: "Écoute attentive et conseils personnalisés pour chaque patient"
              }
            ].map((value, index) => (
              <div key={index} className="group">
                <div className="bg-gray-700/50 p-6 rounded-xl hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-2">
                  <div className="text-primary-400 mb-4 group-hover:scale-110 transition-transform">
                    {value.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">{value.title}</h3>
                  <p className="text-gray-300 text-sm">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Proposés */}
      <section className="py-16 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Nos Services</h2>
            <p className="text-gray-300 text-lg">Une gamme complète pour votre bien-être</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Vente de Médicaments",
                description: "Large gamme de médicaments et produits de santé certifiés",
                features: ["Médicaments sur ordonnance", "Produits en vente libre", "Compléments alimentaires"]
              },
              {
                title: "Conseils Pharmaceutiques",
                description: "Accompagnement personnalisé par nos experts",
                features: ["Consultation gratuite", "Conseils d'usage", "Interactions médicamenteuses"]
              },
              {
                title: "Gestion d'Ordonnances",
                description: "Service numérique pour vos prescriptions",
                features: ["Upload sécurisé", "Validation rapide", "Historique complet"]
              },
              {
                title: "Livraison à Domicile",
                description: "Service de livraison rapide et sécurisé",
                features: ["Livraison express", "Suivi en temps réel", "Paiement mobile"]
              },
              {
                title: "Suivi des Patients",
                description: "Accompagnement pour les maladies chroniques",
                features: ["Rappels de traitement", "Suivi personnalisé", "Alertes santé"]
              },
              {
                title: "Téléconsultation",
                description: "Consultations à distance avec nos pharmaciens",
                features: ["Chat en direct", "Conseils experts", "Disponible 24/7"]
              }
            ].map((service, index) => (
              <div key={index} className="bg-gray-700/30 p-6 rounded-xl hover:bg-gray-700/50 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-3">{service.title}</h3>
                <p className="text-gray-300 mb-4">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-2 text-sm text-gray-400">
                      <CheckCircle className="h-4 w-4 text-primary-400" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Équipe et Expertise */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Notre Équipe</h2>
            <p className="text-gray-300 text-lg">Des professionnels dévoués à votre service</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold text-white mb-6">Expertise & Qualifications</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Award className="h-6 w-6 text-primary-400 mt-1" />
                  <div>
                    <h4 className="font-semibold text-white">Pharmaciens Certifiés</h4>
                    <p className="text-gray-300">Diplômes reconnus et formation continue</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Star className="h-6 w-6 text-primary-400 mt-1" />
                  <div>
                    <h4 className="font-semibold text-white">15+ Années d'Expérience</h4>
                    <p className="text-gray-300">Expertise approfondie du secteur pharmaceutique</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Heart className="h-6 w-6 text-primary-400 mt-1" />
                  <div>
                    <h4 className="font-semibold text-white">Esprit de Service</h4>
                    <p className="text-gray-300">Dévouement total au bien-être de nos patients</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary-500/10 to-blue-500/10 p-8 rounded-2xl border border-primary-500/20">
              <blockquote className="text-lg text-gray-300 italic mb-4">
                "Notre mission est de rendre les soins pharmaceutiques accessibles à tous, 
                en combinant expertise traditionnelle et innovation technologique."
              </blockquote>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">PM</span>
                </div>
                <div>
                  <div className="font-semibold text-white">Équipe PharmaMOS</div>
                  <div className="text-sm text-gray-400">Pharmaciens & Développeurs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Innovation et Modernité */}
      <section className="py-16 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Innovation & Modernité</h2>
            <p className="text-gray-300 text-lg">La technologie au service de votre santé</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 p-6 rounded-xl mb-4">
                <TrendingUp className="h-12 w-12 text-teal-400 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Gestion Informatisée</h3>
              <p className="text-gray-300">Système moderne de gestion des stocks et commandes</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-6 rounded-xl mb-4">
                <Globe className="h-12 w-12 text-purple-400 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Plateforme En Ligne</h3>
              <p className="text-gray-300">Commandes et consultations via notre application web</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 p-6 rounded-xl mb-4">
                <Lightbulb className="h-12 w-12 text-orange-400 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Suivi Digital</h3>
              <p className="text-gray-300">Outils modernes pour le suivi de vos traitements</p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Communautaire */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Impact pour la Communauté</h2>
            <p className="text-gray-300 text-lg">Notre engagement envers la santé publique</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-700/30 p-6 rounded-xl text-center">
              <Target className="h-12 w-12 text-primary-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-3">Santé Publique</h3>
              <p className="text-gray-300">Contribution active à l'amélioration de la santé publique locale</p>
            </div>
            <div className="bg-gray-700/30 p-6 rounded-xl text-center">
              <Users className="h-12 w-12 text-primary-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-3">Sensibilisation</h3>
              <p className="text-gray-300">Campagnes d'éducation sur l'hygiène, vaccination et nutrition</p>
            </div>
            <div className="bg-gray-700/30 p-6 rounded-xl text-center">
              <TrendingUp className="h-12 w-12 text-primary-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-3">Emplois Locaux</h3>
              <p className="text-gray-300">Création d'opportunités d'emploi pour la communauté</p>
            </div>
          </div>
        </div>
      </section>

      {/* Message de Motivation */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-6">
            "Votre santé, notre priorité au quotidien"
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Une pharmacie moderne, proche de vous et de vos besoins
          </p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-primary-600 hover:bg-gray-100 font-semibold rounded-lg transition-colors shadow-xl"
          >
            <span>Découvrir nos services</span>
            <ArrowLeft className="h-5 w-5 rotate-180" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-white rounded-full p-1.5 shadow-md">
                  <img 
                    src="/images/mon_logo.png" 
                    alt="PharmaMOS Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xl font-bold">PharmaMOS</span>
              </div>
              <p className="text-gray-300">
                Votre pharmacie moderne pour une santé accessible à tous.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-gray-300">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>+224 123 456 789</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>contact@pharmacos.gn</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Conakry, Guinée</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Horaires</h3>
              <div className="space-y-2 text-gray-300">
                <div>Lun - Ven: 8h00 - 20h00</div>
                <div>Samedi: 9h00 - 18h00</div>
                <div>Dimanche: 10h00 - 16h00</div>
                <div className="text-primary-400 font-medium">Service en ligne 24h/7j</div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 PharmaMOS. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
