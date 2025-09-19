import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { 
  ArrowLeft, HelpCircle, MessageCircle, Mail, Phone, 
  Clock, FileText, Video, Download, Search, 
  User, ShoppingCart, Lock, AlertTriangle,
  CheckCircle, Send, Headphones, BookOpen, Settings, ChevronUp
} from 'lucide-react';

const Support = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });

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

  const faqs = [
    {
      id: 1,
      category: 'account',
      question: 'Comment créer un compte ?',
      answer: 'Cliquez sur "S\'inscrire" en haut de la page, remplissez le formulaire avec vos informations personnelles, vérifiez votre email et activez votre compte.'
    },
    {
      id: 2,
      category: 'orders',
      question: 'Comment passer une commande ?',
      answer: 'Connectez-vous à votre compte, parcourez notre catalogue, ajoutez les produits au panier, vérifiez votre commande et procédez au paiement.'
    },
    {
      id: 3,
      category: 'prescriptions',
      question: 'Comment télécharger une ordonnance ?',
      answer: 'Dans votre espace client, allez dans "Mes Ordonnances", cliquez sur "Ajouter une ordonnance" et téléchargez une photo claire de votre prescription.'
    },
    {
      id: 4,
      category: 'account',
      question: 'Mot de passe oublié ?',
      answer: 'Cliquez sur "Mot de passe oublié" sur la page de connexion, saisissez votre email et suivez les instructions reçues par email.'
    },
    {
      id: 5,
      category: 'orders',
      question: 'Comment suivre ma commande ?',
      answer: 'Dans votre espace client, section "Mes Commandes", vous pouvez voir le statut en temps réel de toutes vos commandes.'
    },
    {
      id: 6,
      category: 'payments',
      question: 'Quels moyens de paiement acceptez-vous ?',
      answer: 'Nous acceptons les espèces à la livraison, Orange Money, MTN Money et les virements bancaires.'
    }
  ];

  const categories = [
    { id: 'all', name: 'Toutes', icon: HelpCircle },
    { id: 'account', name: 'Compte', icon: User },
    { id: 'orders', name: 'Commandes', icon: ShoppingCart },
    { id: 'prescriptions', name: 'Ordonnances', icon: FileText },
    { id: 'payments', name: 'Paiements', icon: Lock }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleContactSubmit = (e) => {
    e.preventDefault();
    
    // Envoyer notification WebSocket au pharmacien
    const socket = io('http://localhost:5005');
    
    const supportNotification = {
      type: 'support_message',
      title: 'Nouveau message de support',
      message: `${contactForm.name} a envoyé un message: ${contactForm.subject}`,
      category: contactForm.category,
      senderName: contactForm.name,
      senderEmail: contactForm.email,
      subject: contactForm.subject,
      fullMessage: contactForm.message,
      timestamp: new Date().toISOString()
    };
    
    socket.emit('support-notification', supportNotification);
    
    alert('Votre message a été envoyé avec succès !');
    setContactForm({
      name: '',
      email: '',
      subject: '',
      message: '',
      category: 'general'
    });
    
    socket.disconnect();
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
      <section className="bg-gradient-to-br from-green-900 via-gray-900 to-gray-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-green-600/20 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <Headphones className="h-10 w-10 text-green-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 to-primary-400 bg-clip-text text-transparent">
            Centre de Support
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Bienvenue dans notre centre de support. Nous sommes là pour vous aider à utiliser notre plateforme 
            de gestion de pharmacie. Consultez la FAQ ou contactez notre équipe si vous avez besoin d'assistance.
          </p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-gray-800 rounded-xl p-6 text-center hover:bg-gray-700 transition-colors cursor-pointer">
              <div className="bg-blue-600/20 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">Chat en Direct</h3>
              <p className="text-gray-400 text-sm">Assistance immédiate</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 text-center hover:bg-gray-700 transition-colors cursor-pointer">
              <div className="bg-green-600/20 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Mail className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="font-semibold mb-2">Email Support</h3>
              <p className="text-gray-400 text-sm">Réponse sous 24h</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 text-center hover:bg-gray-700 transition-colors cursor-pointer">
              <div className="bg-purple-600/20 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Phone className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="font-semibold mb-2">Téléphone</h3>
              <p className="text-gray-400 text-sm">Lun-Sam 8h-20h</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 text-center hover:bg-gray-700 transition-colors cursor-pointer">
              <div className="bg-orange-600/20 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="font-semibold mb-2">Guides</h3>
              <p className="text-gray-400 text-sm">Tutoriels détaillés</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
              <div className="flex items-center space-x-4 mb-8">
                <div className="bg-blue-600/20 p-3 rounded-lg">
                  <HelpCircle className="h-6 w-6 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold">Questions Fréquentes</h2>
              </div>

              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher dans la FAQ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-8">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{category.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* FAQ Items */}
              <div className="space-y-4">
                {filteredFaqs.map((faq) => (
                  <div key={faq.id} className="bg-gray-700/50 rounded-xl p-6">
                    <h3 className="font-semibold text-lg mb-3 text-primary-400">{faq.question}</h3>
                    <p className="text-gray-300">{faq.answer}</p>
                  </div>
                ))}
                {filteredFaqs.length === 0 && (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Aucune question trouvée pour votre recherche.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Resources */}
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 mt-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-purple-600/20 p-3 rounded-lg">
                  <Download className="h-6 w-6 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold">Documents Utiles</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-4 flex items-center space-x-4">
                  <FileText className="h-8 w-8 text-blue-400" />
                  <div>
                    <h4 className="font-semibold">Guide Utilisateur</h4>
                    <p className="text-gray-400 text-sm">Manuel complet PDF</p>
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4 flex items-center space-x-4">
                  <Video className="h-8 w-8 text-red-400" />
                  <div>
                    <h4 className="font-semibold">Tutoriels Vidéo</h4>
                    <p className="text-gray-400 text-sm">Guides visuels étape par étape</p>
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4 flex items-center space-x-4">
                  <Settings className="h-8 w-8 text-green-400" />
                  <div>
                    <h4 className="font-semibold">Guide Pharmacien</h4>
                    <p className="text-gray-400 text-sm">Manuel professionnel</p>
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4 flex items-center space-x-4">
                  <BookOpen className="h-8 w-8 text-yellow-400" />
                  <div>
                    <h4 className="font-semibold">Guide Rapide</h4>
                    <p className="text-gray-400 text-sm">Démarrage rapide</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 sticky top-24">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-green-600/20 p-3 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-green-400" />
                </div>
                <h2 className="text-xl font-bold">Nous Contacter</h2>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nom complet</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Catégorie</label>
                  <select
                    value={contactForm.category}
                    onChange={(e) => setContactForm({...contactForm, category: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="general">Question générale</option>
                    <option value="technical">Problème technique</option>
                    <option value="account">Problème de compte</option>
                    <option value="order">Problème de commande</option>
                    <option value="billing">Facturation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Sujet</label>
                  <input
                    type="text"
                    required
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    rows={4}
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Envoyer le message</span>
                </button>
              </form>

              {/* Contact Info */}
              <div className="mt-8 pt-8 border-t border-gray-700">
                <h3 className="font-semibold mb-4">Autres moyens de contact</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-blue-400" />
                    <span className="text-sm">mahamadsidiboss@gmail.com</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-green-400" />
                    <span className="text-sm">+224 623 841 149</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm">Lun-Sam: 8h-22h</span>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="mt-6 bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <h4 className="font-semibold text-green-400">Temps de Réponse</h4>
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Chat: Immédiat</li>
                  <li>• Email: Sous 24h</li>
                  <li>• Téléphone: Immédiat</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
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

export default Support;