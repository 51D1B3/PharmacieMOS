import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Shield, Lock, Eye, Users, Database, 
  Clock, Mail, Phone, FileText, CheckCircle, AlertTriangle,
  UserCheck, Settings, Globe, ChevronUp
} from 'lucide-react';

const PrivacyPolicy = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="flex items-center space-x-3 text-primary-400 hover:text-primary-300 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Retour à l'accueil</span>
            </Link>
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <img
                src="/images/mon_logo.png"
                alt="PharmaMOS Logo"
                className="h-10 w-10 rounded-full object-cover border-2 border-primary-500"
              />
              <span className="text-2xl font-bold">PharmaMOS</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-900 via-gray-900 to-gray-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-primary-600/20 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <Shield className="h-10 w-10 text-primary-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">
            Politique de Confidentialité
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Votre vie privée est notre priorité. Découvrez comment nous protégeons et utilisons vos données personnelles.
          </p>
          <div className="mt-8 text-sm text-gray-400">
            <p>Dernière mise à jour : 15 Septembre 2025</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Introduction */}
        <section className="mb-12">
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-blue-600/20 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold">Introduction</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>
                Chez PharmaMOS, nous accordons une importance capitale à la protection de vos données personnelles 
                et au respect de votre vie privée. Cette politique de confidentialité explique comment nous collectons, 
                utilisons, stockons et protégeons vos informations.
              </p>
              <p>
                Notre plateforme respecte scrupuleusement les lois guinéennes sur la protection des données ainsi que 
                les standards internationaux, notamment le RGPD européen pour nos utilisateurs concernés.
              </p>
            </div>
          </div>
        </section>

        {/* Données collectées */}
        <section className="mb-12">
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-green-600/20 p-3 rounded-lg">
                <Database className="h-6 w-6 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold">Données Collectées</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-700/50 rounded-xl p-6">
                <UserCheck className="h-8 w-8 text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold mb-3">Informations Personnelles</h3>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>• Nom et prénom</li>
                  <li>• Adresse complète</li>
                  <li>• Numéro de téléphone</li>
                  <li>• Adresse email</li>
                  <li>• Date de naissance</li>
                </ul>
              </div>
              <div className="bg-gray-700/50 rounded-xl p-6">
                <img
                  src="/images/mon_logo.png"
                  alt="PharmaMOS Logo"
                  className="h-8 w-8 rounded-full object-cover mb-4"
                />
                <h3 className="text-lg font-semibold mb-3">Données Médicales</h3>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>• Ordonnances médicales</li>
                  <li>• Historique d'achats</li>
                  <li>• Allergies connues</li>
                  <li>• Traitements en cours</li>
                  <li>• Préférences médicales</li>
                </ul>
              </div>
              <div className="bg-gray-700/50 rounded-xl p-6">
                <Globe className="h-8 w-8 text-purple-400 mb-4" />
                <h3 className="text-lg font-semibold mb-3">Données de Navigation</h3>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>• Cookies de session</li>
                  <li>• Historique de navigation</li>
                  <li>• Préférences d'affichage</li>
                  <li>• Données de géolocalisation</li>
                  <li>• Statistiques d'utilisation</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Utilisation des données */}
        <section className="mb-12">
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-yellow-600/20 p-3 rounded-lg">
                <Settings className="h-6 w-6 text-yellow-400" />
              </div>
              <h2 className="text-2xl font-bold">Utilisation des Données</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Gestion des Commandes</h4>
                    <p className="text-gray-300 text-sm">Traitement et suivi de vos commandes, gestion des livraisons et facturation.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Suivi Médical</h4>
                    <p className="text-gray-300 text-sm">Gestion de vos ordonnances, rappels de renouvellement et conseils personnalisés.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Communication</h4>
                    <p className="text-gray-300 text-sm">Notifications importantes, rappels de traitement et offres personnalisées.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Amélioration des Services</h4>
                    <p className="text-gray-300 text-sm">Analyse statistique pour optimiser notre plateforme et nos services.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Sécurité</h4>
                    <p className="text-gray-300 text-sm">Prévention de la fraude et protection contre les utilisations malveillantes.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Conformité Légale</h4>
                    <p className="text-gray-300 text-sm">Respect des obligations légales et réglementaires du secteur pharmaceutique.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partage des données */}
        <section className="mb-12">
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-orange-600/20 p-3 rounded-lg">
                <Users className="h-6 w-6 text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold">Partage des Données</h2>
            </div>
            <div className="space-y-6">
              <div className="bg-green-900/20 border border-green-700/50 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <h3 className="text-lg font-semibold text-green-400">Partages Autorisés</h3>
                </div>
                <ul className="text-gray-300 space-y-2">
                  <li>• Avec les professionnels de santé pour assurer la continuité des soins</li>
                  <li>• Avec nos prestataires de confiance (livraison, paiement) sous contrat strict</li>
                  <li>• Avec les autorités sanitaires si requis par la loi</li>
                </ul>
              </div>
              <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                  <h3 className="text-lg font-semibold text-red-400">Jamais de Vente</h3>
                </div>
                <p className="text-gray-300">
                  Nous ne vendons jamais vos données personnelles à des tiers. Votre confiance est notre bien le plus précieux.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sécurité */}
        <section className="mb-12">
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-red-600/20 p-3 rounded-lg">
                <Lock className="h-6 w-6 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold">Sécurité et Stockage</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-600/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2">Serveurs Sécurisés</h3>
                <p className="text-gray-300 text-sm">Hébergement sur des serveurs certifiés avec protection physique et logique.</p>
              </div>
              <div className="text-center">
                <div className="bg-green-600/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Lock className="h-8 w-8 text-green-400" />
                </div>
                <h3 className="font-semibold mb-2">Chiffrement SSL</h3>
                <p className="text-gray-300 text-sm">Toutes les données sensibles sont chiffrées avec les derniers standards.</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-600/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <UserCheck className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="font-semibold mb-2">Accès Limité</h3>
                <p className="text-gray-300 text-sm">Seuls les employés autorisés peuvent accéder aux données clients.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Droits des utilisateurs */}
        <section className="mb-12">
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-purple-600/20 p-3 rounded-lg">
                <Eye className="h-6 w-6 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold">Vos Droits</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-blue-400">Droit d'Accès</h4>
                  <p className="text-gray-300 text-sm">Consultez toutes les données que nous détenons sur vous.</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-green-400">Droit de Rectification</h4>
                  <p className="text-gray-300 text-sm">Modifiez ou corrigez vos informations personnelles.</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-red-400">Droit à l'Effacement</h4>
                  <p className="text-gray-300 text-sm">Demandez la suppression de vos données personnelles.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-yellow-400">Droit d'Opposition</h4>
                  <p className="text-gray-300 text-sm">Refusez certains traitements de vos données.</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-purple-400">Droit à la Portabilité</h4>
                  <p className="text-gray-300 text-sm">Récupérez vos données dans un format exploitable.</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-orange-400">Droit de Limitation</h4>
                  <p className="text-gray-300 text-sm">Limitez le traitement de certaines données.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Conservation */}
        <section className="mb-12">
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-indigo-600/20 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold">Durée de Conservation</h2>
            </div>
            <div className="bg-gray-700/50 rounded-xl p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-indigo-400">Données Personnelles</h4>
                  <p className="text-gray-300 text-sm mb-2">Conservées pendant 5 ans après votre dernière interaction avec notre plateforme.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-indigo-400">Données Médicales</h4>
                  <p className="text-gray-300 text-sm mb-2">Conservées selon les obligations légales pharmaceutiques (jusqu'à 10 ans).</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-indigo-400">Données de Navigation</h4>
                  <p className="text-gray-300 text-sm mb-2">Supprimées automatiquement après 13 mois maximum.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-indigo-400">Comptes Inactifs</h4>
                  <p className="text-gray-300 text-sm mb-2">Suppression automatique après 3 ans d'inactivité totale.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-primary-900/50 to-blue-900/50 rounded-2xl p-8 border border-primary-700/50">
            <div className="text-center mb-8">
              <div className="bg-primary-600/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary-400" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Nous Contacter</h2>
              <p className="text-gray-300">
                Pour toute question concernant vos données personnelles ou cette politique de confidentialité
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 rounded-xl p-6 text-center">
                <Mail className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Email</h4>
                <p className="text-primary-400">mahamadsidiboss@gmail.com</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-6 text-center">
                <Phone className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Téléphone</h4>
                <p className="text-primary-400">+224 623 841 149</p>
              </div>
            </div>
          </div>
        </section>

        {/* Mises à jour */}
        <section className="mb-12">
          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-2xl p-8">
            <div className="flex items-center space-x-4 mb-4">
              <AlertTriangle className="h-6 w-6 text-yellow-400" />
              <h2 className="text-xl font-bold">Mises à Jour de la Politique</h2>
            </div>
            <p className="text-gray-300">
              Cette politique peut être modifiée pour refléter les évolutions légales ou techniques. 
              Nous vous informerons de tout changement significatif par email ou notification sur la plateforme.
            </p>
          </div>
        </section>

      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default PrivacyPolicy;