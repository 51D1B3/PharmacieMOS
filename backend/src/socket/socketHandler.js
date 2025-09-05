const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/Chat');
const logger = require('../utils/logger');

const socketHandler = (io) => {
  // Namespace pour le chat
  const chatNamespace = io.of('/chat');
  
  // Namespace pour le POS
  const posNamespace = io.of('/pos');
  
  // Namespace pour l'admin
  const adminNamespace = io.of('/admin');

  // Middleware d'authentification pour tous les namespaces
  const authenticateSocket = async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Token d\'authentification requis'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('+permissions');
      
      if (!user || !user.isActive) {
        return next(new Error('Utilisateur non trouvé ou inactif'));
      }

      socket.user = user;
      socket.userId = user._id;
      socket.userRole = user.role;
      socket.userPermissions = user.permissions;
      
      next();
    } catch (error) {
      logger.error('Erreur d\'authentification Socket.IO:', error);
      next(new Error('Token invalide'));
    }
  };

  // Appliquer l'authentification à tous les namespaces
  chatNamespace.use(authenticateSocket);
  posNamespace.use(authenticateSocket);
  adminNamespace.use(authenticateSocket);

  // Gestionnaire pour le namespace chat
  chatNamespace.on('connection', (socket) => {
    logger.info(`Client connecté au chat: ${socket.userId} (${socket.userRole})`);

    // Rejoindre la room de l'utilisateur
    socket.join(`user_${socket.userId}`);
    
    // Si c'est un admin, rejoindre la room des pharmaciens/admins
    if (['admin'].includes(socket.userRole)) {
      socket.join('pharmaciens');
    }

    // Mettre à jour le statut de présence
    socket.emit('chat:presence:update', {
      userId: socket.userId,
      status: 'online',
      timestamp: new Date()
    });

    // Événement: Envoyer un message
    socket.on('chat:message:send', async (data) => {
      try {
        const { recipientId, content, type = 'text', attachments = [] } = data;

        // Validation des données
        if (!recipientId || !content) {
          socket.emit('chat:error', {
            message: 'Destinataire et contenu requis',
            code: 'INVALID_MESSAGE_DATA'
          });
          return;
        }

        // Vérifier que l'utilisateur peut envoyer un message
        if (socket.userRole === 'client') {
          // Les clients ne peuvent envoyer des messages qu'à l'administrateur
          const recipient = await User.findById(recipientId);
          if (!recipient || !['admin'].includes(recipient.role)) {
            socket.emit('chat:error', {
              message: 'Destinataire invalide',
              code: 'INVALID_RECIPIENT'
            });
            return;
          }
        }

        // Créer le message
        const message = await Chat.create({
          sender: socket.userId,
          recipient: recipientId,
          content,
          type,
          attachments
        });

        // Populate les informations de l'expéditeur
        await message.populate('sender', 'nom prenom email');
        await message.populate('recipient', 'nom prenom email');

        // Émettre le message aux destinataires
        const messageData = {
          id: message._id,
          sender: message.sender,
          recipient: message.recipient,
          content: message.content,
          type: message.type,
          attachments: message.attachments,
          timestamp: message.createdAt,
          isRead: false
        };

        // Envoyer au destinataire
        chatNamespace.to(`user_${recipientId}`).emit('chat:message:received', messageData);
        
        // Envoyer une confirmation à l'expéditeur
        socket.emit('chat:message:sent', {
          ...messageData,
          status: 'sent'
        });

        // Logger le message
        logger.audit('CHAT_MESSAGE_SENT', socket.user, {
          recipientId,
          messageId: message._id,
          type
        });

      } catch (error) {
        logger.error('Erreur lors de l\'envoi du message:', error);
        socket.emit('chat:error', {
          message: 'Erreur lors de l\'envoi du message',
          code: 'MESSAGE_SEND_ERROR'
        });
      }
    });

    // Événement: Marquer un message comme lu
    socket.on('chat:message:read', async (data) => {
      try {
        const { messageId } = data;

        const message = await Chat.findById(messageId);
        if (!message) {
          socket.emit('chat:error', {
            message: 'Message non trouvé',
            code: 'MESSAGE_NOT_FOUND'
          });
          return;
        }

        // Vérifier que l'utilisateur est le destinataire
        if (message.recipient.toString() !== socket.userId.toString()) {
          socket.emit('chat:error', {
            message: 'Non autorisé',
            code: 'UNAUTHORIZED'
          });
          return;
        }

        // Marquer comme lu
        message.isRead = true;
        message.readAt = new Date();
        await message.save();

        // Notifier l'expéditeur
        chatNamespace.to(`user_${message.sender}`).emit('chat:message:read', {
          messageId: message._id,
          readAt: message.readAt
        });

      } catch (error) {
        logger.error('Erreur lors du marquage du message comme lu:', error);
        socket.emit('chat:error', {
          message: 'Erreur lors du marquage du message',
          code: 'MESSAGE_READ_ERROR'
        });
      }
    });

    // Événement: Indicateur de frappe
    socket.on('chat:typing', (data) => {
      const { recipientId, isTyping } = data;
      
      chatNamespace.to(`user_${recipientId}`).emit('chat:typing', {
        userId: socket.userId,
        isTyping,
        timestamp: new Date()
      });
    });

    // Événement: Mettre à jour le statut de présence
    socket.on('chat:presence:update', (data) => {
      const { status } = data;
      
      // Émettre à tous les utilisateurs connectés
      chatNamespace.emit('chat:presence:update', {
        userId: socket.userId,
        status,
        timestamp: new Date()
      });
    });

    // Événement: Demander l'historique des messages
    socket.on('chat:history:request', async (data) => {
      try {
        const { recipientId, limit = 50, before } = data;

        let query = {
          $or: [
            { sender: socket.userId, recipient: recipientId },
            { sender: recipientId, recipient: socket.userId }
          ]
        };

        if (before) {
          query.createdAt = { $lt: new Date(before) };
        }

        const messages = await Chat.find(query)
          .sort({ createdAt: -1 })
          .limit(limit)
          .populate('sender', 'nom prenom email')
          .populate('recipient', 'nom prenom email');

        socket.emit('chat:history:response', {
          messages: messages.reverse(),
          hasMore: messages.length === limit
        });

      } catch (error) {
        logger.error('Erreur lors de la récupération de l\'historique:', error);
        socket.emit('chat:error', {
          message: 'Erreur lors de la récupération de l\'historique',
          code: 'HISTORY_ERROR'
        });
      }
    });

    // Déconnexion
    socket.on('disconnect', () => {
      logger.info(`Client déconnecté du chat: ${socket.userId}`);
      
      // Mettre à jour le statut de présence
      chatNamespace.emit('chat:presence:update', {
        userId: socket.userId,
        status: 'offline',
        timestamp: new Date()
      });
    });
  });

  // Gestionnaire pour le namespace POS
  posNamespace.on('connection', (socket) => {
    logger.info(`POS connecté: ${socket.userId} (${socket.userRole})`);

    // Vérifier que l'utilisateur a les permissions POS (admin uniquement désormais)
    if (!['admin'].includes(socket.userRole)) {
      socket.disconnect();
      return;
    }

    // Rejoindre la room POS
    socket.join('pos');

    // Événement: Créer une vente
    socket.on('pos:sale:create', async (data) => {
      try {
        const { items, customer, paymentMethod, total } = data;

        // Créer la vente (à implémenter avec le modèle Order)
        // const sale = await Order.create({ ... });

        // Confirmer la création
        socket.emit('pos:sale:created', {
          success: true,
          saleId: 'temp-id', // Remplacer par l'ID réel
          timestamp: new Date()
        });

        // Notifier les autres terminaux POS
        posNamespace.to('pos').emit('pos:sale:new', {
          saleId: 'temp-id',
          seller: socket.userId,
          timestamp: new Date()
        });

      } catch (error) {
        logger.error('Erreur lors de la création de la vente POS:', error);
        socket.emit('pos:error', {
          message: 'Erreur lors de la création de la vente',
          code: 'SALE_CREATION_ERROR'
        });
      }
    });

    // Événement: Synchronisation offline
    socket.on('pos:sync:offline', async (data) => {
      try {
        const { sales } = data;

        // Traiter les ventes offline (à implémenter)
        // for (const sale of sales) {
        //   await Order.create(sale);
        // }

        socket.emit('pos:sync:completed', {
          success: true,
          syncedCount: sales.length,
          timestamp: new Date()
        });

      } catch (error) {
        logger.error('Erreur lors de la synchronisation POS:', error);
        socket.emit('pos:error', {
          message: 'Erreur lors de la synchronisation',
          code: 'SYNC_ERROR'
        });
      }
    });

    // Événement: Ouvrir/fermer la caisse
    socket.on('pos:register:status', (data) => {
      const { action, registerId } = data;
      
      posNamespace.to('pos').emit('pos:register:status', {
        action,
        registerId,
        userId: socket.userId,
        timestamp: new Date()
      });
    });

    socket.on('disconnect', () => {
      logger.info(`POS déconnecté: ${socket.userId}`);
    });
  });

  // Gestionnaire pour le namespace admin
  adminNamespace.on('connection', (socket) => {
    logger.info(`Admin connecté: ${socket.userId} (${socket.userRole})`);

    // Vérifier que l'utilisateur est admin
    if (socket.userRole !== 'admin') {
      socket.disconnect();
      return;
    }

    // Rejoindre la room admin
    socket.join('admin');

    // Événement: Alertes de stock
    socket.on('admin:stock:subscribe', () => {
      socket.join('stock_alerts');
    });

    socket.on('admin:stock:unsubscribe', () => {
      socket.leave('stock_alerts');
    });

    // Événement: Notifications de commandes
    socket.on('admin:orders:subscribe', () => {
      socket.join('order_notifications');
    });

    socket.on('admin:orders:unsubscribe', () => {
      socket.leave('order_notifications');
    });

    // Événement: Statistiques en temps réel
    socket.on('admin:stats:subscribe', () => {
      socket.join('real_time_stats');
    });

    socket.on('admin:stats:unsubscribe', () => {
      socket.leave('real_time_stats');
    });

    socket.on('disconnect', () => {
      logger.info(`Admin déconnecté: ${socket.userId}`);
    });
  });

  // Fonctions utilitaires pour émettre des événements depuis d'autres parties de l'application

  // Émettre une alerte de stock
  const emitStockAlert = (product, currentStock, threshold) => {
    adminNamespace.to('stock_alerts').emit('admin:stock:alert', {
      productId: product._id,
      productName: product.name,
      currentStock,
      threshold,
      timestamp: new Date()
    });
  };

  // Émettre une notification de nouvelle commande
  const emitNewOrder = (order) => {
    adminNamespace.to('order_notifications').emit('admin:order:new', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      customer: order.customer,
      total: order.totalTTC,
      timestamp: new Date()
    });
  };

  // Émettre une mise à jour de commande
  const emitOrderUpdate = (order, status) => {
    adminNamespace.to('order_notifications').emit('admin:order:update', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status,
      timestamp: new Date()
    });
  };

  // Émettre des statistiques en temps réel
  const emitRealTimeStats = (stats) => {
    adminNamespace.to('real_time_stats').emit('admin:stats:update', {
      ...stats,
      timestamp: new Date()
    });
  };

  // Exposer les fonctions utilitaires
  io.emitStockAlert = emitStockAlert;
  io.emitNewOrder = emitNewOrder;
  io.emitOrderUpdate = emitOrderUpdate;
  io.emitRealTimeStats = emitRealTimeStats;

  logger.success('Socket.IO handlers configurés');
};

module.exports = socketHandler;
