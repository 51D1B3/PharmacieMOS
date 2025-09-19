import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Users, ShoppingCart, CreditCard, 
  Shield, AlertTriangle, CheckCircle, UserCheck, 
  Lock, Globe, Mail, Phone, Settings, Award, ChevronUp
} from 'lucide-react';

const TermsOfService = () => {
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
      <section className="bg-gradient-to-br from-blue-900 via-gray-900 to-gray-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-blue-600/20 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <FileText className="h-10 w-10 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-primary-400 bg-clip-text text-transparent">
            Conditions d'Utilisation
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            En accédant à notre plateforme de gestion de pharmacie, vous acceptez les présentes conditions d'utilisation. 
            Nous vous invitons à les lire attentivement avant toute utilisation de nos services.
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
                Bienvenue sur PharmaMOS, votre plateforme de gestion pharmaceutique moderne et sécurisée. 
                Ces conditions d'utilisation régissent votre accès et votre utilisation de notre service.
              </p>
              <p>
                En créant un compte ou en utilisant nos services, vous acceptez d'être lié par ces conditions. 
                Si vous n'acceptez pas ces termes, veuillez ne pas utiliser notre plateforme.
              </p>
            </div>
          </div>
        </section>

        {/* Accès au service */}
        <section className="mb-12">
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-green-600/20 p-3 rounded-lg">
                <Users className="h-6 w-6 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold">Accès au Service</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-700/50 rounded-xl p-6 text-center">
                <UserCheck className="h-8 w-8 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-3">Clients</h3>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>• Commande de médicaments</li>
                  <li>• Gestion des ordonnances</li>
                  <li>• Suivi des traitements</li>
                  <li>• Consultation de l'historique</li>
                </ul>
              </div>
              <div className="bg-gray-700/50 rounded-xl p-6 text-center">
                <img
                  src="/images/mon_logo.png"
                  alt="PharmaMOS Logo"
                  className="h-8 w-8 rounded-full object-cover mx-auto mb-4"
                />
                <h3 className="text-lg font-semibold mb-3">Pharmaciens</h3>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>• Validation des ordonnances</li>
                  <li>• Gestion des stocks</li>
                  <li>• Conseil aux patients</li>
                  <li>• Suivi des ventes</li>
                </ul>
              </div>
              <div className="bg-gray-700/50 rounded-xl p-6 text-center">
                <Settings className="h-8 w-8 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-3">Administrateurs</h3>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>• Gestion complète du système</li>
                  <li>• Supervision des utilisateurs</li>
                  <li>• Rapports et statistiques</li>
                  <li>• Configuration avancée</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 bg-blue-900/20 border border-blue-700/50 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-3">
                <Lock className="h-5 w-5 text-blue-400" />
                <h4 className="font-semibold text-blue-400">Connexion Sécurisée Requise</h4>
              </div>
              <p className="text-gray-300 text-sm">
                Tous les utilisateurs doivent créer un compte sécurisé avec un mot de passe fort et 
                maintenir la confidentialité de leurs identifiants de connexion.
              </p>
            </div>
          </div>
        </section>

        {/* Utilisation autorisée */}
        <section className="mb-12">
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-green-600/20 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold">Utilisation Autorisée</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-900/20 border border-green-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-green-400 mb-4">✅ Utilisations Permises</h3>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>• Commander des produits pharmaceutiques légaux</li>
                  <li>• Gérer vos ordonnances médicales</li>
                  <li>• Consulter des informations médicales fiables</li>
                  <li>• Communiquer avec les professionnels de santé</li>
                  <li>• Suivre vos traitements et rappels</li>
                  <li>• Accéder à votre historique médical</li>
                </ul>
              </div>
              <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-red-400 mb-4">❌ Utilisations Interdites</h3>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>• Activités illégales ou frauduleuses</li>
                  <li>• Partage de comptes utilisateur</li>
                  <li>• Tentatives de piratage ou intrusion</li>
                  <li>• Utilisation de fausses ordonnances</li>
                  <li>• Revente non autorisée de médicaments</li>
                  <li>• Spam ou communications abusives</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Compte utilisateur */}
        <section className="mb-12">
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-purple-600/20 p-3 rounded-lg">
                <UserCheck className="h-6 w-6 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold">Compte Utilisateur</h2>
            </div>
            <div className="space-y-6">
              <div className="bg-gray-700/50 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="h-6 w-6 text-blue-400" />
                  <h3 className="text-lg font-semibold">Responsabilités de l'Utilisateur</h3>
                </div>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>• Maintenir la confidentialité de votre mot de passe</li>
                  <li>• Fournir des informations exactes et à jour lors de l'inscription</li>
                  <li>• Notifier immédiatement tout accès non autorisé à votre compte</li>
                  <li>• Utiliser uniquement votre propre compte personnel</li>
                  <li>• Mettre à jour vos informations personnelles si nécessaire</li>
                </ul>
              </div>
              <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  <h4 className="font-semibold text-yellow-400">Important</h4>
                </div>
                <p className="text-gray-300 text-sm">
                  Vous êtes entièrement responsable de toutes les activités qui se produisent sous votre compte. 
                  En cas de compromission, contactez-nous immédiatement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Produits et services */}
        <section className="mb-12">
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-orange-600/20 p-3 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold">Produits et Services</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-blue-400">Disponibilité des Produits</h4>
                  <p className="text-gray-300 text-sm">
                    Tous les produits sont soumis à disponibilité. Les prix peuvent varier selon les fournisseurs.
                  </p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-green-400">Médicaments sur Ordonnance</h4>
                  <p className="text-gray-300 text-sm">
                    Certains médicaments nécessitent une ordonnance médicale valide et vérifiée.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-red-400">Droit de Refus</h4>
                  <p className="text-gray-300 text-sm">
                    Nous nous réservons le droit de refuser toute commande non conforme ou suspecte.
                  </p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-purple-400">Conseil Pharmaceutique</h4>
                  <p className="text-gray-300 text-sm">
                    Nos pharmaciens sont disponibles pour vous conseiller sur l'utilisation des médicaments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Paiements */}
        <section className="mb-12">
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-green-600/20 p-3 rounded-lg">
                <CreditCard className="h-6 w-6 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold">Paiements et Facturation</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-700/50 rounded-xl p-6 text-center">
                <div className="bg-blue-600/20 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2">Espèces</h3>
                <p className="text-gray-300 text-sm">Paiement en espèces à la livraison ou en pharmacie</p>
              </div>
              <div className="bg-gray-700/50 rounded-xl p-6 text-center">
                <div className="bg-green-600/20 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <Globe className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="font-semibold mb-2">Mobile Money</h3>
                <p className="text-gray-300 text-sm">Orange Money, MTN Money et autres services mobiles</p>
              </div>
              <div className="bg-gray-700/50 rounded-xl p-6 text-center">
                <div className="bg-purple-600/20 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="font-semibold mb-2">Sécurisé</h3>
                <p className="text-gray-300 text-sm">Toutes les transactions sont sécurisées et chiffrées</p>
              </div>
            </div>
          </div>
        </section>

        {/* Responsabilités */}
        <section className="mb-12">
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-yellow-600/20 p-3 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-400" />
              </div>
              <h2 className="text-2xl font-bold">Limitations de Responsabilité</h2>
            </div>
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-6">
              <p className="text-gray-300 mb-4">
                PharmaMOS ne peut être tenu responsable dans les cas suivants :
              </p>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Utilisation incorrecte des médicaments par le patient</li>
                <li>• Retards de livraison dus à des fournisseurs tiers</li>
                <li>• Erreurs résultant d'informations incomplètes fournies par l'utilisateur</li>
                <li>• Réactions allergiques non déclarées préalablement</li>
                <li>• Interruptions de service dues à la maintenance ou cas de force majeure</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Propriété intellectuelle */}
        <section className="mb-12">
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-indigo-600/20 p-3 rounded-lg">
                <Award className="h-6 w-6 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold">Propriété Intellectuelle</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>
                Tout le contenu de la plateforme PharmaMOS (textes, images, logos, interface, code source) 
                est protégé par les droits de propriété intellectuelle et appartient à PharmaMOS ou à ses partenaires.
              </p>
              <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <h4 className="font-semibold text-red-400">Interdiction</h4>
                </div>
                <p className="text-gray-300 text-sm">
                  Il est strictement interdit de copier, reproduire, distribuer ou réutiliser tout contenu 
                  sans autorisation écrite préalable.
                </p>
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
              <h2 className="text-2xl font-bold mb-4">Questions sur les Conditions</h2>
              <p className="text-gray-300">
                Pour toute question concernant ces conditions d'utilisation
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

        {/* Modifications */}
        <section className="mb-12">
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-2xl p-8">
            <div className="flex items-center space-x-4 mb-4">
              <Settings className="h-6 w-6 text-blue-400" />
              <h2 className="text-xl font-bold">Modification des Conditions</h2>
            </div>
            <p className="text-gray-300">
              PharmaMOS se réserve le droit de modifier ces conditions d'utilisation à tout moment. 
              Les utilisateurs seront informés des changements significatifs par email ou notification 
              sur la plateforme. L'utilisation continue du service après modification constitue une acceptation des nouvelles conditions.
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

export default TermsOfService;