import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Send, Search, Filter, RefreshCw, Eye, 
  Clock, User, CheckCircle, AlertCircle, Phone, Mail
} from 'lucide-react';

const AdminMessagesManager = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const mockMessages = [
        {
          id: 'M001',
          client: {
            name: 'Fatou Barry',
            email: 'fatou.barry@email.com',
            phone: '+224612345678'
          },
          subject: 'Disponibilité produit',
          message: 'Bonjour, avez-vous du paracétamol 500mg en stock? J\'en aurais besoin pour demain matin.',
          status: 'unread',
          priority: 'normal',
          createdAt: '2024-08-26T14:30:00Z',
          category: 'product_inquiry'
        },
        {
          id: 'M002',
          client: {
            name: 'Mamadou Bah',
            email: 'mamadou.bah@email.com',
            phone: '+224655987654'
          },
          subject: 'Statut réservation',
          message: 'Bonjour, ma réservation #R001 est-elle prête pour le retrait? Merci de me confirmer.',
          status: 'unread',
          priority: 'high',
          createdAt: '2024-08-26T13:15:00Z',
          category: 'reservation',
          replies: [
            {
              id: 'R001',
              sender: 'admin',
              message: 'Bonjour, votre réservation est prête. Vous pouvez venir la récupérer.',
              sentAt: '2024-08-26T13:45:00Z'
            }
          ]
        },
        {
          id: 'M003',
          client: {
            name: 'Marie Diallo',
            email: 'marie.diallo@email.com',
            phone: '+224623841149'
          },
          subject: 'Problème commande',
          message: 'Bonjour, j\'ai un problème avec ma dernière commande #CMD001. Un produit manque dans le paquet reçu.',
          status: 'read',
          priority: 'high',
          createdAt: '2024-08-25T16:20:00Z',
          category: 'complaint',
          replies: [
            {
              id: 'R002',
              sender: 'admin',
              message: 'Bonjour Marie, nous sommes désolés pour ce désagrément. Nous allons vérifier et vous recontacter rapidement.',
              sentAt: '2024-08-25T17:00:00Z'
            }
          ]
        },
        {
          id: 'M004',
          client: {
            name: 'Ahmed Camara',
            email: 'ahmed.camara@email.com',
            phone: '+224664123456'
          },
          subject: 'Demande de conseil',
          message: 'Bonjour, pourriez-vous me conseiller un médicament contre les maux de tête chroniques?',
          status: 'replied',
          priority: 'normal',
          createdAt: '2024-08-25T10:45:00Z',
          category: 'consultation',
          replies: [
            {
              id: 'R003',
              sender: 'admin',
              message: 'Bonjour Ahmed, je vous recommande de consulter un médecin pour un diagnostic précis. En attendant, vous pouvez prendre du paracétamol selon les indications.',
              sentAt: '2024-08-25T11:30:00Z'
            }
          ]
        }
      ];
      
      setMessages(mockMessages);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'unread': return 'Non lu';
      case 'read': return 'Lu';
      case 'replied': return 'Répondu';
      case 'closed': return 'Fermé';
      default: return 'Inconnu';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'unread': return 'bg-red-100 text-red-800 border-red-200';
      case 'read': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'replied': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'normal': return 'border-l-blue-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'product_inquiry': return 'Demande produit';
      case 'reservation': return 'Réservation';
      case 'complaint': return 'Réclamation';
      case 'consultation': return 'Consultation';
      case 'general': return 'Général';
      default: return 'Autre';
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleMarkAsRead = (messageId) => {
    setMessages(prev => prev.map(message => 
      message.id === messageId 
        ? { ...message, status: 'read' }
        : message
    ));
  };

  const handleSendReply = (messageId) => {
    if (!replyText.trim()) return;

    const newReply = {
      id: `R${Date.now()}`,
      sender: 'admin',
      message: replyText,
      sentAt: new Date().toISOString()
    };

    setMessages(prev => prev.map(message => 
      message.id === messageId 
        ? { 
            ...message, 
            status: 'replied',
            replies: [...(message.replies || []), newReply]
          }
        : message
    ));

    setReplyText('');
    setShowDetails(false);
  };

  const handleViewDetails = (message) => {
    setSelectedMessage(message);
    setShowDetails(true);
    if (message.status === 'unread') {
      handleMarkAsRead(message.id);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUnreadCount = () => {
    return messages.filter(m => m.status === 'unread').length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MessageSquare className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Messages clients</h2>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
            {filteredMessages.length} messages
          </span>
          {getUnreadCount() > 0 && (
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
              {getUnreadCount()} non lus
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={loadMessages}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par client, sujet ou contenu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="unread">Non lus</option>
              <option value="read">Lus</option>
              <option value="replied">Répondus</option>
              <option value="closed">Fermés</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filteredMessages.map((message) => (
            <div 
              key={message.id} 
              className={`p-6 hover:bg-gray-50 cursor-pointer border-l-4 ${getPriorityColor(message.priority)} ${
                message.status === 'unread' ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleViewDetails(message)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{message.client.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-600">{getCategoryLabel(message.category)}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(message.status)}`}>
                      {getStatusLabel(message.status)}
                    </span>
                  </div>
                  
                  <h3 className="font-medium text-gray-900 mb-2">{message.subject}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{message.message}</p>
                  
                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(message.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="h-3 w-3" />
                      <span>{message.client.phone}</span>
                    </div>
                    {message.replies && message.replies.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{message.replies.length} réponse(s)</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {message.priority === 'high' && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <Eye className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredMessages.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun message trouvé</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Aucun message ne correspond à vos critères de recherche.' 
              : 'Aucun message pour le moment.'}
          </p>
        </div>
      )}

      {/* Message Details Modal */}
      {showDetails && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedMessage.subject}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedMessage.status)}`}>
                    {getStatusLabel(selectedMessage.status)}
                  </span>
                </div>
                <button 
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Client Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{selectedMessage.client.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{selectedMessage.client.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{selectedMessage.client.phone}</span>
                  </div>
                </div>
              </div>

              {/* Original Message */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Message original</h4>
                  <span className="text-sm text-gray-500">{formatDate(selectedMessage.createdAt)}</span>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <p className="text-gray-700">{selectedMessage.message}</p>
                </div>
              </div>

              {/* Replies */}
              {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Réponses</h4>
                  <div className="space-y-3">
                    {selectedMessage.replies.map((reply) => (
                      <div key={reply.id} className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-green-800">Vous</span>
                          <span className="text-sm text-gray-500">{formatDate(reply.sentAt)}</span>
                        </div>
                        <p className="text-gray-700">{reply.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply Form */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Répondre</h4>
                <div className="space-y-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Tapez votre réponse ici..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                  <div className="flex justify-end space-x-3">
                    <button 
                      onClick={() => setShowDetails(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button 
                      onClick={() => handleSendReply(selectedMessage.id)}
                      disabled={!replyText.trim()}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4" />
                      <span>Envoyer</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessagesManager;
