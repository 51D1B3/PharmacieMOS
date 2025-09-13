import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  // Expéditeur et destinataire
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Contenu du message
  content: {
    type: String,
    required: true,
    maxlength: [2000, 'Le message ne peut pas dépasser 2000 caractères']
  },
  
  // Type de message
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'prescription', 'system'],
    default: 'text'
  },
  
  // Pièces jointes
  attachments: [{
    url: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    thumbnail: String // URL de la miniature pour les images
  }],
  
  // Statut du message
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  
  // Statut de livraison
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: Date,
  
  // Statut d'envoi
  isSent: {
    type: Boolean,
    default: false
  },
  sentAt: Date,
  
  // Réponse à un autre message
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat'
  },
  
  // Métadonnées
  metadata: {
    // Pour les messages de prescription
    prescription: {
      patientName: String,
      doctorName: String,
      prescriptionDate: Date,
      validity: Date
    },
    
    // Pour les messages système
    system: {
      action: String,
      details: mongoose.Schema.Types.Mixed
    },
    
    // Informations de localisation (optionnel)
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    }
  },
  
  // Tags pour la recherche
  tags: [String],
  
  // Priorité du message
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Expiration du message (pour les messages temporaires)
  expiresAt: Date,
  
  // Statut d'archivage
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: Date,
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour les performances
chatSchema.index({ sender: 1, recipient: 1 });
chatSchema.index({ recipient: 1, sender: 1 });
chatSchema.index({ createdAt: -1 });
chatSchema.index({ isRead: 1 });
chatSchema.index({ type: 1 });
chatSchema.index({ priority: 1 });
chatSchema.index({ expiresAt: 1 });
chatSchema.index({ isArchived: 1 });
chatSchema.index({ tags: 1 });

// Index composés pour les conversations
chatSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
chatSchema.index({ recipient: 1, sender: 1, createdAt: -1 });

// Virtual pour vérifier si le message a expiré
chatSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Virtual pour le statut du message
chatSchema.virtual('status').get(function() {
  if (this.isArchived) return 'archived';
  if (this.isExpired) return 'expired';
  if (this.isRead) return 'read';
  if (this.isDelivered) return 'delivered';
  if (this.isSent) return 'sent';
  return 'pending';
});

// Virtual pour la conversation ID (pour grouper les messages)
chatSchema.virtual('conversationId').get(function() {
  const participants = [this.sender.toString(), this.recipient.toString()].sort();
  return participants.join('_');
});

// Middleware pre-save
chatSchema.pre('save', function(next) {
  // Marquer comme envoyé si c'est un nouveau message
  if (this.isNew) {
    this.isSent = true;
    this.sentAt = new Date();
  }
  
  // Marquer comme lu si le statut change
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  
  // Marquer comme livré si le statut change
  if (this.isModified('isDelivered') && this.isDelivered && !this.deliveredAt) {
    this.deliveredAt = new Date();
  }
  
  next();
});

// Méthodes d'instance
chatSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

chatSchema.methods.markAsDelivered = function() {
  this.isDelivered = true;
  this.deliveredAt = new Date();
  return this.save();
};

chatSchema.methods.archive = function(archivedBy) {
  this.isArchived = true;
  this.archivedAt = new Date();
  this.archivedBy = archivedBy;
  return this.save();
};

chatSchema.methods.unarchive = function() {
  this.isArchived = false;
  this.archivedAt = undefined;
  this.archivedBy = undefined;
  return this.save();
};

// Méthodes statiques
chatSchema.statics.getConversation = function(user1Id, user2Id, options = {}) {
  const {
    page = 1,
    limit = 50,
    before,
    after,
    includeArchived = false
  } = options;
  
  let query = {
    $or: [
      { sender: user1Id, recipient: user2Id },
      { sender: user2Id, recipient: user1Id }
    ]
  };
  
  // Filtrer les messages archivés
  if (!includeArchived) {
    query.isArchived = false;
  }
  
  // Filtrer par date
  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }
  
  if (after) {
    query.createdAt = { $gt: new Date(after) };
  }
  
  const skip = (page - 1) * limit;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'nom prenom email')
    .populate('recipient', 'nom prenom email')
    .populate('replyTo', 'content type')
    .populate('archivedBy', 'nom prenom');
};

chatSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    recipient: userId,
    isRead: false,
    isArchived: false
  });
};

chatSchema.statics.getConversations = function(userId, options = {}) {
  const { limit = 20 } = options;
  
  return this.aggregate([
    {
      $match: {
        $or: [
          { sender: mongoose.Types.ObjectId(userId) },
          { recipient: mongoose.Types.ObjectId(userId) }
        ],
        isArchived: false
      }
    },
    {
      $addFields: {
        conversationPartner: {
          $cond: {
            if: { $eq: ['$sender', mongoose.Types.ObjectId(userId)] },
            then: '$recipient',
            else: '$sender'
          }
        }
      }
    },
    {
      $group: {
        _id: '$conversationPartner',
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$recipient', mongoose.Types.ObjectId(userId)] },
                  { $eq: ['$isRead', false] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $sort: { 'lastMessage.createdAt': -1 }
    },
    {
      $limit: limit
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'partner'
      }
    },
    {
      $unwind: '$partner'
    },
    {
      $project: {
        partner: {
          _id: 1,
          nom: 1,
          prenom: 1,
          email: 1,
          role: 1
        },
        lastMessage: {
          _id: 1,
          content: 1,
          type: 1,
          createdAt: 1,
          isRead: 1
        },
        unreadCount: 1
      }
    }
  ]);
};

chatSchema.statics.searchMessages = function(userId, query, options = {}) {
  const {
    page = 1,
    limit = 20,
    conversationPartner = null
  } = options;
  
  let searchQuery = {
    $or: [
      { sender: userId },
      { recipient: userId }
    ],
    isArchived: false,
    $text: { $search: query }
  };
  
  if (conversationPartner) {
    searchQuery.$or = [
      { sender: userId, recipient: conversationPartner },
      { sender: conversationPartner, recipient: userId }
    ];
  }
  
  const skip = (page - 1) * limit;
  
  return this.find(searchQuery)
    .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'nom prenom email')
    .populate('recipient', 'nom prenom email');
};

chatSchema.statics.getMessagesByType = function(userId, type, options = {}) {
  const {
    page = 1,
    limit = 20,
    conversationPartner = null
  } = options;
  
  let query = {
    $or: [
      { sender: userId },
      { recipient: userId }
    ],
    type,
    isArchived: false
  };
  
  if (conversationPartner) {
    query.$or = [
      { sender: userId, recipient: conversationPartner },
      { sender: conversationPartner, recipient: userId }
    ];
  }
  
  const skip = (page - 1) * limit;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'nom prenom email')
    .populate('recipient', 'nom prenom email');
};

chatSchema.statics.getPrescriptionMessages = function(userId, options = {}) {
  return this.getMessagesByType(userId, 'prescription', options);
};

chatSchema.statics.getSystemMessages = function(userId, options = {}) {
  return this.getMessagesByType(userId, 'system', options);
};

// Nettoyer les messages expirés
chatSchema.statics.cleanupExpiredMessages = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

// Statistiques des messages
chatSchema.statics.getMessageStats = function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        $or: [
          { sender: mongoose.Types.ObjectId(userId) },
          { recipient: mongoose.Types.ObjectId(userId) }
        ],
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        sentCount: {
          $sum: {
            $cond: [
              { $eq: ['$sender', mongoose.Types.ObjectId(userId)] },
              1,
              0
            ]
          }
        },
        receivedCount: {
          $sum: {
            $cond: [
              { $eq: ['$recipient', mongoose.Types.ObjectId(userId)] },
              1,
              0
            ]
          }
        },
        readCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$recipient', mongoose.Types.ObjectId(userId)] },
                  { $eq: ['$isRead', true] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
};

export default mongoose.model('Chat', chatSchema);