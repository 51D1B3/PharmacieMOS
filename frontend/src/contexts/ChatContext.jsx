import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  // Load conversations from localStorage on mount
  useEffect(() => {
    if (user) {
      const savedConversations = localStorage.getItem(`chat_conversations_${user._id}`);
      const savedUnreadCount = localStorage.getItem(`chat_unread_${user._id}`);
      
      if (savedConversations) {
        const parsedConversations = JSON.parse(savedConversations);
        // Convert timestamp strings back to Date objects
        const conversationsWithDates = parsedConversations.map(conv => ({
          ...conv,
          timestamp: new Date(conv.timestamp),
          messages: conv.messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setConversations(conversationsWithDates);
      }
      
      if (savedUnreadCount) {
        setUnreadCount(parseInt(savedUnreadCount));
      }
    }
  }, [user]);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (user && conversations.length >= 0) {
      localStorage.setItem(`chat_conversations_${user._id}`, JSON.stringify(conversations));
    }
  }, [conversations, user]);

  // Save unread count to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(`chat_unread_${user._id}`, unreadCount.toString());
    }
  }, [unreadCount, user]);

  // Real-time polling to check for new messages from other users
  useEffect(() => {
    if (!user) return;

    const pollInterval = setInterval(() => {
      // Check if there are new messages in localStorage from other users
      const currentConversations = JSON.parse(localStorage.getItem(`chat_conversations_${user._id}`) || '[]');
      const currentUnreadCount = parseInt(localStorage.getItem(`chat_unread_${user._id}`) || '0');
      
      // Update state if there are changes
      if (JSON.stringify(currentConversations) !== JSON.stringify(conversations)) {
        const conversationsWithDates = currentConversations.map(conv => ({
          ...conv,
          timestamp: new Date(conv.timestamp),
          messages: conv.messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setConversations(conversationsWithDates);
      }
      
      if (currentUnreadCount !== unreadCount) {
        setUnreadCount(currentUnreadCount);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [user, conversations, unreadCount]);

  const getRandomMessage = () => {
    const clientMessages = [
      'Merci pour votre aide',
      'Avez-vous d\'autres recommandations?',
      'À quelle heure fermez-vous?',
      'Puis-je réserver ce médicament?',
      'Combien coûte ce traitement?'
    ];
    
    const adminMessages = [
      'Je vérifie cela pour vous',
      'Oui, nous avons ce produit en stock',
      'Je vous recommande de consulter votre médecin',
      'Nous sommes ouverts jusqu\'à 20h',
      'Bien sûr, je peux vous le réserver'
    ];

    const messages = user.role === 'admin' || user.role === 'pharmacist' ? clientMessages : adminMessages;
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const sendMessage = (conversationId, text, targetUserId = null) => {
    const newMessage = {
      id: Date.now(),
      senderId: user._id,
      senderName: `${user.prenom || ''} ${user.nom || ''}`.trim() || user.name || (user.role === 'admin' || user.role === 'pharmacist' ? 'PharmaMOS' : 'Client'),
      text: text,
      timestamp: new Date(),
      isAdmin: user.role === 'admin' || user.role === 'pharmacist',
      isEdited: false
    };

    // Update current user's conversations
    setConversations(prev => {
      const existingConv = prev.find(conv => conv.id === conversationId);
      
      if (existingConv) {
        // Update existing conversation
        return prev.map(conv => {
          if (conv.id === conversationId) {
            const updatedConv = {
              ...conv,
              messages: [...conv.messages, newMessage],
              lastMessage: text,
              timestamp: new Date()
            };
            
            // If message is from client to admin, increment unread count for admin
            if (!newMessage.isAdmin && (user.role !== 'admin' && user.role !== 'pharmacist')) {
              updatedConv.unreadCount = (conv.unreadCount || 0) + 1;
            }
            
            return updatedConv;
          }
          return conv;
        });
      } else {
        // Create new conversation
        const isCurrentUserAdmin = user.role === 'admin' || user.role === 'pharmacist';
        const newConversation = {
          id: conversationId,
          clientId: isCurrentUserAdmin ? conversationId : user._id,
          clientName: isCurrentUserAdmin ? 'Client' : `${user.prenom || ''} ${user.nom || ''}`.trim() || user.name || 'Client',
          clientAvatar: isCurrentUserAdmin ? 'CL' : (user.prenom && user.nom ? `${user.prenom[0]}${user.nom[0]}`.toUpperCase() : (user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'CL')),
          lastMessage: text,
          timestamp: new Date(),
          unreadCount: 0,
          isOnline: true,
          messages: [newMessage]
        };
        
        return [...prev, newConversation];
      }
    });

    // Also update the other user's conversations (simulate real-time)
    if (targetUserId || !newMessage.isAdmin) {
      const otherUserId = targetUserId || 'admin';
      const otherUserConversations = JSON.parse(localStorage.getItem(`chat_conversations_${otherUserId}`) || '[]');
      const otherUserUnreadCount = parseInt(localStorage.getItem(`chat_unread_${otherUserId}`) || '0');
      
      const existingConvIndex = otherUserConversations.findIndex(conv => 
        conv.id === conversationId || conv.clientId === user._id
      );
      
      if (existingConvIndex >= 0) {
        // Update existing conversation for other user
        otherUserConversations[existingConvIndex] = {
          ...otherUserConversations[existingConvIndex],
          messages: [...otherUserConversations[existingConvIndex].messages, newMessage],
          lastMessage: text,
          timestamp: new Date(),
          unreadCount: (otherUserConversations[existingConvIndex].unreadCount || 0) + 1
        };
      } else {
        // Create new conversation for other user (admin)
        const newConvForOther = {
          id: user._id,
          clientId: user._id,
          clientName: `${user.prenom || ''} ${user.nom || ''}`.trim() || user.name || 'Client',
          clientAvatar: user.prenom && user.nom ? `${user.prenom[0]}${user.nom[0]}`.toUpperCase() : (user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'CL'),
          lastMessage: text,
          timestamp: new Date(),
          unreadCount: 1,
          isOnline: true,
          messages: [newMessage]
        };
        otherUserConversations.push(newConvForOther);
      }
      
      // Save to localStorage for other user
      localStorage.setItem(`chat_conversations_${otherUserId}`, JSON.stringify(otherUserConversations));
      localStorage.setItem(`chat_unread_${otherUserId}`, (otherUserUnreadCount + 1).toString());
    }

    console.log('Message sent:', newMessage);
    return newMessage;
  };

  const markAsRead = (conversationId) => {
    setConversations(prev =>
      prev.map(conv => {
        if (conv.id === conversationId) {
          const unreadToSubtract = conv.unreadCount;
          setUnreadCount(prevCount => Math.max(0, prevCount - unreadToSubtract));
          return { ...conv, unreadCount: 0 };
        }
        return conv;
      })
    );
  };

  const editMessage = (conversationId, messageId, newText) => {
    setConversations(prev =>
      prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: conv.messages.map(msg =>
              msg.id === messageId
                ? { ...msg, text: newText, isEdited: true, editedAt: new Date() }
                : msg
            )
          };
        }
        return conv;
      })
    );
  };

  const deleteMessage = (conversationId, messageId) => {
    setConversations(prev =>
      prev.map(conv => {
        if (conv.id === conversationId) {
          const updatedMessages = conv.messages.filter(msg => msg.id !== messageId);
          return {
            ...conv,
            messages: updatedMessages,
            lastMessage: updatedMessages.length > 0 ? updatedMessages[updatedMessages.length - 1].text : ''
          };
        }
        return conv;
      })
    );
  };

  const getConversation = (conversationId) => {
    return conversations.find(conv => conv.id === conversationId);
  };

  const value = {
    conversations,
    unreadCount,
    sendMessage,
    markAsRead,
    getConversation,
    editMessage,
    deleteMessage,
    socket
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
