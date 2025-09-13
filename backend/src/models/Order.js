import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'La quantité doit être au moins de 1']
  },
  priceHT: {
    type: Number,
    required: true,
    min: [0, 'Le prix ne peut pas être négatif']
  },
  priceTTC: {
    type: Number,
    required: true,
    min: [0, 'Le prix ne peut pas être négatif']
  },
  taxRate: {
    type: Number,
    required: true,
    min: [0, 'Le taux de TVA ne peut pas être négatif']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'La remise ne peut pas être négative']
  },
  totalHT: {
    type: Number,
    required: true,
    min: [0, 'Le total HT ne peut pas être négatif']
  },
  totalTTC: {
    type: Number,
    required: true,
    min: [0, 'Le total TTC ne peut pas être négatif']
  },
  prescription: {
    type: String, // URL de l'image de l'ordonnance
    // La validation de la présence de l'ordonnance doit être gérée dans la logique métier (contrôleur)
  },
  notes: {
    type: String,
    maxlength: [500, 'Les notes ne peuvent pas dépasser 500 caractères']
  }
}, {
  timestamps: true
});

const orderSchema = new mongoose.Schema({
  // Informations client
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Numéro de commande
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  
  // Type de commande
  orderType: {
    type: String,
    enum: ['reservation', 'commande', 'vente_pos'],
    required: true
  },
  
  // Statut de la commande
  status: {
    type: String,
    enum: [
      'pending', 'confirmed', 'preparing', 'ready', 'shipped', 'delivered',
      'cancelled', 'refunded', 'failed'
    ],
    default: 'pending'
  },
  
  // Items de la commande
  items: [orderItemSchema],
  
  // Calculs des totaux
  subtotalHT: {
    type: Number,
    required: true,
    min: [0, 'Le sous-total HT ne peut pas être négatif']
  },
  subtotalTTC: {
    type: Number,
    required: true,
    min: [0, 'Le sous-total TTC ne peut pas être négatif']
  },
  taxTotal: {
    type: Number,
    required: true,
    min: [0, 'Le total des taxes ne peut pas être négatif']
  },
  discountTotal: {
    type: Number,
    default: 0,
    min: [0, 'Le total des remises ne peut pas être négatif']
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: [0, 'Les frais de livraison ne peuvent pas être négatifs']
  },
  totalHT: {
    type: Number,
    required: true,
    min: [0, 'Le total HT ne peut pas être négatif']
  },
  totalTTC: {
    type: Number,
    required: true,
    min: [0, 'Le total TTC ne peut pas être négatif']
  },
  
  // Mode de livraison/retrait
  deliveryMethod: {
    type: String,
    enum: ['pickup', 'delivery'],
    required: true
  },
  
  // Adresse de livraison
  shippingAddress: {
    rue: String,
    ville: String,
    codePostal: String,
    pays: {
      type: String,
      default: 'Guinée'
    },
    instructions: String
  },
  
  // Informations de contact
  contactInfo: {
    nom: String,
    prenom: String,
    telephone: String,
    email: String
  },
  
  // Paiement
  payment: {
    method: {
      type: String,
      enum: ['cash', 'orange_money', 'mtn_money', 'card', 'bank_transfer'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    amount: {
      type: Number,
      required: true,
      min: [0, 'Le montant ne peut pas être négatif']
    },
    currency: {
      type: String,
      default: 'GNF'
    },
    paidAt: Date,
    refundedAt: Date
  },
  
  // Dates importantes
  estimatedDeliveryDate: Date,
  actualDeliveryDate: Date,
  pickupDate: Date,
  expiryDate: {
    type: Date,
    default: function() {
      const date = new Date();
      date.setDate(date.getDate() + 7); // 7 jours par défaut
      return date;
    }
  },
  
  // Notes et commentaires
  notes: {
    customer: {
      type: String,
      maxlength: [1000, 'Les notes client ne peuvent pas dépasser 1000 caractères']
    },
    internal: {
      type: String,
      maxlength: [1000, 'Les notes internes ne peuvent pas dépasser 1000 caractères']
    }
  },
  
  // Coupons et promotions
  coupon: {
    code: String,
    discount: {
      type: Number,
      min: [0, 'La remise ne peut pas être négative']
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    }
  },
  
  // Vendeur/Pharmacien
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // POS spécifique
  pos: {
    terminalId: String,
    sessionId: String,
    isOffline: {
      type: Boolean,
      default: false
    },
    syncedAt: Date
  },
  
  // Notifications
  notifications: {
    emailSent: {
      type: Boolean,
      default: false
    },
    smsSent: {
      type: Boolean,
      default: false
    },
    pushSent: {
      type: Boolean,
      default: false
    }
  },
  
  // Audit
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    reason: String
  }],
  
  // Facturation
  invoice: {
    number: String,
    generatedAt: Date,
    pdfUrl: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour les performances

orderSchema.index({ customer: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderType: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ estimatedDeliveryDate: 1 });
orderSchema.index({ expiryDate: 1 });
orderSchema.index({ seller: 1 });

// Virtual pour vérifier si la commande est expirée
orderSchema.virtual('isExpired').get(function() {
  return this.expiryDate && this.expiryDate < new Date();
});

// Virtual pour vérifier si la commande peut être annulée
orderSchema.virtual('canBeCancelled').get(function() {
  const cancellableStatuses = ['pending', 'confirmed', 'preparing'];
  return cancellableStatuses.includes(this.status);
});

// Virtual pour vérifier si la commande peut être modifiée
orderSchema.virtual('canBeModified').get(function() {
  const modifiableStatuses = ['pending', 'confirmed'];
  return modifiableStatuses.includes(this.status);
});

// Virtual pour le statut de livraison
orderSchema.virtual('deliveryStatus').get(function() {
  if (this.deliveryMethod === 'pickup') {
    return this.status === 'delivered' ? 'retiré' : 'en attente de retrait';
  } else {
    return this.status === 'delivered' ? 'livré' : 'en cours de livraison';
  }
});

// Middleware pre-save pour générer le numéro de commande
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Compter les commandes du jour
    const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    
    const count = await this.constructor.countDocuments({
      createdAt: { $gte: todayStart, $lt: todayEnd }
    });
    
    const sequence = String(count + 1).padStart(4, '0');
    this.orderNumber = `CMD-${year}${month}${day}-${sequence}`;
  }
  
  // Ajouter au statut history si le statut a changé
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date()
    });
  }
  
  next();
});

// Méthodes d'instance
orderSchema.methods.updateStatus = function(newStatus, changedBy = null, reason = null) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    changedBy,
    changedAt: new Date(),
    reason
  });
  
  return this.save();
};

orderSchema.methods.calculateTotals = function() {
  let subtotalHT = 0;
  let subtotalTTC = 0;
  let taxTotal = 0;
  let discountTotal = 0;
  
  this.items.forEach(item => {
    const itemTotalHT = (item.priceHT * item.quantity) - item.discount;
    const itemTotalTTC = (item.priceTTC * item.quantity) - item.discount;
    
    subtotalHT += itemTotalHT;
    subtotalTTC += itemTotalTTC;
    taxTotal += (item.priceTTC - item.priceHT) * item.quantity;
    discountTotal += item.discount;
  });
  
  // Appliquer la remise coupon si applicable
  if (this.coupon && this.coupon.discount) {
    if (this.coupon.discountType === 'percentage') {
      const couponDiscount = (subtotalTTC * this.coupon.discount) / 100;
      discountTotal += couponDiscount;
      subtotalTTC -= couponDiscount;
    } else {
      discountTotal += this.coupon.discount;
      subtotalTTC -= this.coupon.discount;
    }
  }
  
  this.subtotalHT = subtotalHT;
  this.subtotalTTC = subtotalTTC;
  this.taxTotal = taxTotal;
  this.discountTotal = discountTotal;
  this.totalHT = subtotalHT + this.shippingCost;
  this.totalTTC = subtotalTTC + this.shippingCost;
  
  return this;
};

orderSchema.methods.addItem = function(product, quantity, priceHT, priceTTC, taxRate, prescription = null, notes = null) {
  const item = {
    product: product._id,
    quantity,
    priceHT,
    priceTTC,
    taxRate,
    discount: 0,
    totalHT: priceHT * quantity,
    totalTTC: priceTTC * quantity,
    prescription,
    notes
  };
  
  this.items.push(item);
  this.calculateTotals();
  
  return this.save();
};

orderSchema.methods.removeItem = function(itemIndex) {
  if (itemIndex >= 0 && itemIndex < this.items.length) {
    this.items.splice(itemIndex, 1);
    this.calculateTotals();
    return this.save();
  }
  throw new Error('Index d\'item invalide');
};

// Méthodes statiques
orderSchema.statics.findByCustomer = function(customerId, options = {}) {
  const { page = 1, limit = 20, status } = options;
  
  let filter = { customer: customerId };
  if (status) filter.status = status;
  
  return this.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('items.product', 'name brand dosage form image priceTTC')
    .populate('seller', 'nom prenom');
};

orderSchema.statics.findPendingReservations = function() {
  return this.find({
    orderType: 'reservation',
    status: 'pending',
    expiryDate: { $gt: new Date() }
  }).populate('customer', 'nom prenom email telephone');
};

orderSchema.statics.findExpiredReservations = function() {
  return this.find({
    orderType: 'reservation',
    status: 'pending',
    expiryDate: { $lte: new Date() }
  });
};

orderSchema.statics.getOrderStats = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $nin: ['cancelled', 'failed'] }
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalTTC' },
        averageOrderValue: { $avg: '$totalTTC' }
      }
    }
  ]);
};

export default mongoose.model('Order', orderSchema);