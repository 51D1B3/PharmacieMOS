import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Users, Clock, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useChat } from '../contexts/ChatContext.jsx';
import MessageContextMenu from './MessageContextMenu.jsx';
import apiService from '../services/api.jsx';

const AdminChatNotification = () => {
  const { user } = useAuth();
  const { conversations, unreadCount, sendMessage, markAsRead, getConversation, editMessage, deleteMessage } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);

  // Using ChatContext for data management

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    setMessages(conversation.messages || []);
    
    // Mark conversation as read using context
    markAsRead(conversation.id);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    // Send message using context
    const message = sendMessage(selectedConversation.id, newMessage, selectedConversation.clientId);
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
    if (selectedConversation) {
      editMessage(selectedConversation.id, messageId, newText);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, text: newText, isEdited: true, editedAt: new Date() }
            : msg
        )
      );
    }
  };

  const handleDeleteMessage = (messageId) => {
    if (selectedConversation) {
      deleteMessage(selectedConversation.id, messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}j`;
  };

  return (
    <>
      {/* Chat Notification Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(true)}
          className="relative p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[80vh] flex overflow-hidden">
            
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Messages clients</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un client..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => handleConversationSelect(conversation)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation?.id === conversation.id ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
                          {conversation.clientAvatar}
                        </div>
                        {conversation.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 truncate">
                            {conversation.clientName}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {formatTime(conversation.timestamp)}
                            </span>
                            {conversation.unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {conversation.lastMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
                          {selectedConversation.clientAvatar}
                        </div>
                        {selectedConversation.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{selectedConversation.clientName}</h4>
                        <p className="text-sm text-gray-600">
                          {selectedConversation.isOnline ? 'En ligne' : `Vu ${formatTime(selectedConversation.timestamp)}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isAdmin ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          onClick={(e) => handleMessageClick(message, e)}
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg cursor-pointer hover:opacity-80 ${
                            message.isAdmin
                              ? 'bg-green-500 text-white rounded-br-none'
                              : 'bg-gray-200 text-gray-900 rounded-bl-none'
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className={`text-xs ${message.isAdmin ? 'text-green-100' : 'text-gray-500'}`}>
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {message.isEdited && (
                              <span className={`text-xs italic ${message.isAdmin ? 'text-green-200' : 'text-gray-400'}`}>
                                modifié
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Tapez votre réponse..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Sélectionnez une conversation
                    </h3>
                    <p className="text-gray-600">
                      Choisissez un client dans la liste pour commencer à discuter
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
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

export default AdminChatNotification;
