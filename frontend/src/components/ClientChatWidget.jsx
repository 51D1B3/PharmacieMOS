import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Minimize2, Phone, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useChat } from '../contexts/ChatContext.jsx';
import MessageContextMenu from './MessageContextMenu.jsx';

const ClientChatWidget = ({ predefinedMessage, isOpen: isOpenProp, onClose: onCloseProp }) => {
  const { user } = useAuth();
  const { conversations, sendMessage, getConversation, editMessage, deleteMessage, unreadCount } = useChat();
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [contextMenu, setContextMenu] = useState(null);
  const messagesEndRef = useRef(null);
  const [isOpen, setIsOpen] = useState(isOpenProp || false);

  // Sync with external prop to open the widget
  useEffect(() => {
    if (isOpenProp) {
      setIsOpen(true);
    }
  }, [isOpenProp]);

  // Using ChatContext for data management

  useEffect(() => {
    if (user) {
      setConnectionStatus('connected');
      // Get the client's conversation with admin if it exists
      const clientConversation = conversations.find(conv => conv.clientId === user._id);
      if (clientConversation) {
        setMessages(clientConversation.messages || []);
      } else {
        setMessages([]);
      }
    }
  }, [user, conversations]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle predefined message
  useEffect(() => {
    if (predefinedMessage && predefinedMessage.trim()) {
      setNewMessage(predefinedMessage);
      setIsMinimized(false);
      // The parent component is responsible for setting isOpen to true, which will trigger the effect above.
    }
  }, [predefinedMessage]);

  // Simulate real-time messaging
  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        // Simulate admin typing indicator
        if (Math.random() > 0.95) {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            // Simulate admin response
            if (Math.random() > 0.7) {
              const responses = [
                'Je vérifie cela pour vous...',
                'Oui, nous avons ce produit en stock.',
                'Pouvez-vous me donner plus de détails?',
                'Je vous recommande de consulter votre médecin.',
                'Nous sommes ouverts de 8h à 20h du lundi au samedi.'
              ];
              const randomResponse = responses[Math.floor(Math.random() * responses.length)];
              
              setMessages(prev => [...prev, {
                id: Date.now(),
                senderId: 'admin',
                senderName: 'PharmaMOS',
                text: randomResponse,
                timestamp: new Date(),
                isAdmin: true
              }]);
            }
          }, 2000);
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    // Use user ID as conversation ID to create unique conversation per client
    const conversationId = user._id;
    const message = sendMessage(conversationId, newMessage, 'admin');
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleMessageClick = (message, event) => {
    // Only allow editing/deleting own messages
    if (message.senderId === user._id) {
      setContextMenu({
        message,
        position: { x: event.clientX, y: event.clientY }
      });
    }
  };

  const handleEditMessage = (messageId, newText) => {
    const conversationId = user._id;
    editMessage(conversationId, messageId, newText);
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, text: newText, isEdited: true, editedAt: new Date() }
          : msg
      )
    );
  };

  const handleDeleteMessage = (messageId) => {
    const conversationId = user._id;
    deleteMessage(conversationId, messageId);
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onCloseProp) {
      onCloseProp();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) return null;

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50 relative"
          style={{ position: 'fixed' }}
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-20 right-4 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 transition-all duration-300 ${
          isMinimized ? 'w-80 h-14' : 'w-96 h-[500px]'
        }`}>
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-green-600 text-white rounded-t-xl relative dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center relative dark:bg-primary-700">
                <User className="h-4 w-4 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold text-[10px]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-sm">PharmaMOS en ligne</h3>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-300' : 'bg-yellow-300'
                  }`}></div>
                  <span className="text-xs">
                    {connectionStatus === 'connected' ? 'En ligne' : 'Connexion...'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-green-700 rounded"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-green-700 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 h-80 bg-gray-50 dark:bg-gray-900">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isAdmin ? 'justify-start' : 'justify-end'}`}
                    >
                      <div 
                        onClick={(e) => handleMessageClick(message, e)}
                        className={`max-w-xs px-4 py-2 rounded-lg cursor-pointer hover:opacity-80 ${
                        message.isAdmin
                          ? 'bg-white text-gray-800 rounded-bl-none shadow-sm dark:bg-gray-800 dark:text-gray-100'
                          : 'bg-green-500 text-white rounded-br-none dark:bg-primary-600'
                      }`}>
                        <p className="text-sm">{message.text}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className={`text-xs ${
                            message.isAdmin ? 'text-gray-500 dark:text-gray-300' : 'text-green-100'
                          }`}>
                            {formatTime(message.timestamp)}
                          </p>
                          {message.isEdited && (
                            <span className={`text-xs italic ${message.isAdmin ? 'text-gray-400 dark:text-gray-400' : 'text-green-200'}`}>
                              modifié
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white text-gray-800 px-4 py-2 rounded-lg rounded-bl-none shadow-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tapez votre message..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
                
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    onClick={() => setNewMessage('Bonjour, j\'ai une question sur un médicament')}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200"
                  >
                    Question médicament
                  </button>
                  <button
                    onClick={() => setNewMessage('Quels sont vos horaires d\'ouverture?')}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200"
                  >
                    Horaires
                  </button>
                  <button
                    onClick={() => setNewMessage('Avez-vous ce produit en stock?')}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200"
                  >
                    Stock produit
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <MessageContextMenu
            message={contextMenu.message}
            position={contextMenu.position}
            onEdit={handleEditMessage}
            onDelete={handleDeleteMessage}
            onClose={() => setContextMenu(null)}
            canEdit={contextMenu.message.senderId === user._id}
          />
        </>
      )}
    </>
  );
};

export default ClientChatWidget;
