import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { MessageSquare, Send, X, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { API_BASE_URL, SOCKET_URL } from '../config/api.js';

const ClientChat = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (isOpen) {
      const newSocket = io(SOCKET_URL);
      setSocket(newSocket);
      
      newSocket.on('new-message', (message) => {
        setMessages(prev => [...prev, message]);
      });
      
      newSocket.on('message-updated', (message) => {
        setMessages(prev => prev.map(m => m._id === message._id ? message : m));
      });
      
      newSocket.on('message-deleted', (messageId) => {
        setMessages(prev => prev.filter(m => m._id !== messageId));
      });
      
      loadMessages();
      
      return () => newSocket.close();
    }
  }, [isOpen]);

  const loadMessages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: newMessage
        })
      });
      
      if (response.ok) {
        setNewMessage('');
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
    }
  };
  
  const editMessage = async (messageId, newText) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: newText })
      });
      
      if (response.ok) {
        setEditingMessage(null);
        setEditText('');
      }
    } catch (error) {
      console.error('Erreur modification message:', error);
    }
  };
  
  const deleteMessage = async (messageId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Erreur suppression message:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col z-50">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          <MessageSquare className="h-4 w-4 mr-2 text-blue-600" />
          Chat Pharmacien
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div key={message._id} className={`flex ${message.sender?._id === user?.id ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-xs px-3 py-2 rounded-lg text-sm cursor-pointer relative ${
                message.sender?._id === user?.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              }`}
              onClick={() => setSelectedMessage(selectedMessage === message._id ? null : message._id)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">
                  {message.sender?.role === 'pharmacien' ? 'Pharmacien' : 'Vous'}
                </span>
                {message.edited && (
                  <span className="text-xs opacity-60">(modifié)</span>
                )}
              </div>
              <p>{message.message}</p>
              <p className="text-xs opacity-75 mt-1">
                {new Date(message.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
              
              {selectedMessage === message._id && message.sender?._id === user?.id && (
                <div className="absolute top-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-2 flex space-x-1 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingMessage(message._id);
                      setEditText(message.message);
                      setSelectedMessage(null);
                    }}
                    className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                  >
                    <Edit className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMessage(message._id);
                    }}
                    className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {editingMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-md w-full mx-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Modifier le message</h3>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              rows={3}
            />
            <div className="flex justify-end space-x-2 mt-3">
              <button
                onClick={() => {
                  setEditingMessage(null);
                  setEditText('');
                }}
                className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={() => editMessage(editingMessage, editText)}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Tapez votre message..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-3 py-2 rounded-lg"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientChat;