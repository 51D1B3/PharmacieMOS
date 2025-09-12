import mongoose from 'mongoose';
import slugify from 'slugify';

const productSchema = new mongoose.Schema({
  // Informations de base
  name: {
    type: String,
    required: [true, 'Le nom du produit est requis'],
    trim: true,
    maxlength: [200, 'Le nom ne peut pas dépasser 200 caractères']
  },
  brand: {
    type: String,
    required: [true, 'La marque est requise'],
    trim: true,
    maxlength: [100, 'La marque ne peut pas dépasser 100 caractères']
  },
  dosage: {
    type: String,
    required: [true, 'Le dosage est requis'],
    trim: true,
    maxlength: [50, 'Le dosage ne peut pas dépasser 50 caractères']
  },
  form: {
    type: String,
    required: [true, 'La forme galénique est requise'],
    enum: ['comprimé', 'sirop', 'gélule', 'crème', 'pommade', 'injection', 'suppositoire', 'collyre', 'spray', 'autre']
  },
  
  // Codes et identifiants
  sku: {
    type: String,
    required: [true, 'Le SKU est requis'],
    unique: true,
    trim: true,
    uppercase: true
  },
  purchaseCount: {
    type: Number,
    default: 0,
    min: 0
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^[0-9]{8,14}$/.test(v);
      },
      message: 'Le code-barres doit contenir entre 8 et 14 chiffres'
    }
  },
  
  // Description et contenu
  description: {
    type: String,
    required: [true, 'La description est requise'],
    maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères']
  },
  posologie: {
    type: String,
    maxlength: [1000, 'La posologie ne peut pas dépasser 1000 caractères']
  },
  composition: {
    type: String,
    maxlength: [1000, 'La composition ne peut pas dépasser 1000 caractères']
  },
  contreIndications: {
    type: String,
    maxlength: [1000, 'Les contre-indications ne peuvent pas dépasser 1000 caractères']
  },
  effetsSecondaires: {
    type: String,
    maxlength: [1000, 'Les effets secondaires ne peuvent pas dépasser 1000 caractères']
  },
  
  // Image
  image: {
    type: String,
    required: [true, "L'image du produit est requise"]
  },
  
  // Fournisseur
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, 'Le fournisseur est requis']
  },
  
  // Catégorisation
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'La catégorie est requise']
  },
  
  // Prix et taxes
  priceHT: {
    type: Number,
    required: [true, 'Le prix HT est requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  taxRate: {
    type: Number,
    required: [true, 'Le taux de TVA est requis'],
    min: [0, 'Le taux de TVA ne peut pas être négatif'],
    max: [100, 'Le taux de TVA ne peut pas dépasser 100%'],
    default: 0
  },
  priceTTC: {
    type: Number,
    min: [0, 'Le prix ne peut pas être négatif']
  },
  
  // Remises
  discount: {
    percentage: {
      type: Number,
      min: [0, 'La remise ne peut pas être négative'],
      max: [100, 'La remise ne peut pas dépasser 100%'],
      default: 0
    },
    startDate: Date,
    endDate: Date
  },
  
  // Gestion des stocks
  stock: {
    onHand: {
      type: Number,
      min: [0, 'Le stock ne peut pas être négatif'],
      default: 0
    },
    reserved: {
      type: Number,
      min: [0, 'Le stock réservé ne peut pas être négatif'],
      default: 0
    },
    thresholdAlert: {
      type: Number,
      min: [0, 'Le seuil d\'alerte ne peut pas être négatif'],
      default: 10
    },
    maxStock: {
      type: Number,
      min: [0, 'Le stock maximum ne peut pas être négatif']
    },
    location: {
      type: String,
      maxlength: [100, 'L\'emplacement ne peut pas dépasser 100 caractères']
    }
  },
  
  // Dates importantes
  expiryDate: {
    type: Date,
    validate: {
      // La validation ne s'applique que si le champ est nouveau ou modifié
      validator: function(v) {
        if (this.isModified('expiryDate') || this.isNew) {
          return !v || v > new Date();
        }
        return true;
      },
      message: 'La date d\'expiration doit être dans le futur'
    }
  },
  manufacturingDate: Date,
  
  // Prescription et réglementation
  isPrescriptionRequired: {
    type: Boolean,
    default: false
  },
  prescriptionType: {
    type: String,
    enum: ['libre', 'ordonnance_simple', 'ordonnance_restreinte', 'stupefiant'],
    default: 'libre'
  },
  isReimbursed: {
    type: Boolean,
    default: false
  },
  reimbursementRate: {
    type: Number,
    min: [0, 'Le taux de remboursement ne peut pas être négatif'],
    max: [100, 'Le taux de remboursement ne peut pas dépasser 100%'],
    default: 0
  },
  
  // Tags et SEO
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Un tag ne peut pas dépasser 50 caractères']
  }],
  seo: {
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },
    metaTitle: {
      type: String,
      maxlength: [60, 'Le titre meta ne peut pas dépasser 60 caractères']
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'La description meta ne peut pas dépasser 160 caractères']
    },
    keywords: [String]
  },
  
  // Statut et visibilité
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  
  // Statistiques
  statistics: {
    views: {
      type: Number,
      default: 0
    },
    sales: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    reviewCount: {
      type: Number,
      default: 0
    }
  },
  
  // Informations supplémentaires
  packaging: {
    type: String,
    maxlength: [200, 'L\'emballage ne peut pas dépasser 200 caractères']
  },
  storageConditions: {
    type: String,
    maxlength: [500, 'Les conditions de stockage ne peuvent pas dépasser 500 caractères']
  },
  activeIngredient: {
    type: String,
    maxlength: [200, 'Le principe actif ne peut pas dépasser 200 caractères']
  },
  dosageForm: {
    type: String,
    maxlength: [100, 'La forme de dosage ne peut pas dépasser 100 caractères']
  },
  
  // Historique des prix
  priceHistory: [{
    priceHT: {
      type: Number,
      required: true
    },
    priceTTC: {
      type: Number,
      required: true
    },
    taxRate: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    reason: {
      type: String,
      enum: ['initial', 'modification', 'augmentation', 'diminution', 'promotion', 'autre']
    }
  }],

  // Suivi de l'utilisateur (manquant dans le schéma original)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
    // Pas de 'required: true' pour ne pas casser les documents existants
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour les performances
productSchema.index({ name: 'text', brand: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });

productSchema.index({ supplierId: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isAvailable: 1 });
productSchema.index({ 'stock.onHand': 1 });
productSchema.index({ expiryDate: 1 });


// Virtual pour le stock disponible
productSchema.virtual('stockAvailable').get(function() {
  return Math.max(0, this.stock.onHand - this.stock.reserved);
});

// Virtual pour vérifier si le stock est faible
productSchema.virtual('isLowStock').get(function() {
  return this.stockAvailable <= this.stock.thresholdAlert;
});

// Virtual pour vérifier si le produit est en rupture
productSchema.virtual('isOutOfStock').get(function() {
  return this.stockAvailable === 0;
});

// Virtual pour vérifier si le stock atteint le seuil d'alerte de 50
productSchema.virtual('isStockAlert50').get(function() {
  return this.stockAvailable <= 50;
});

// Virtual pour le prix avec remise
productSchema.virtual('discountedPrice').get(function() {
  const now = new Date();
  if (
    this.discount &&
    this.discount.percentage > 0 &&
    (!this.discount.startDate || this.discount.startDate <= now) &&
    (!this.discount.endDate || this.discount.endDate >= now)
  ) {
    // Applique la remise et arrondit à 2 décimales
    return parseFloat((this.priceTTC * (1 - this.discount.percentage / 100)).toFixed(2));
  }
  return this.priceTTC;
});

// Virtual pour vérifier si une remise est active
productSchema.virtual('hasActiveDiscount').get(function() {
  const now = new Date();
  return !!(this.discount &&
    this.discount.percentage > 0 &&
    (!this.discount.startDate || this.discount.startDate <= now) &&
    (!this.discount.endDate || this.discount.endDate >= now)
  );
});

// Middleware pre-save pour calculer le prix TTC et générer le slug
productSchema.pre('save', function(next) {
  // Calculer le prix TTC
  this.priceTTC = this.priceHT * (1 + this.taxRate / 100);
  
  // Générer le slug SEO
  if (!this.seo.slug) {
    this.seo.slug = slugify(`${this.name} ${this.brand} ${this.dosage}`, {
      lower: true,
      strict: true,
      locale: 'fr'
    });
  }
  
  // Ajouter à l'historique des prix si le prix a changé
  if (this.isModified('priceHT') || this.isModified('taxRate')) {
    this.priceHistory.push({
      priceHT: this.priceHT,
      priceTTC: this.priceTTC,
      taxRate: this.taxRate,
      reason: this.priceHistory.length === 0 ? 'initial' : 'modification'
    });
  }
  
  next();
});

// Méthodes d'instance
productSchema.methods.updateStock = function(quantity, type = 'sale') {
  switch (type) {
    case 'sale':
      this.stock.onHand = Math.max(0, this.stock.onHand - quantity);
      break;
    case 'purchase':
      this.stock.onHand += quantity;
      break;
    case 'reserve':
      this.stock.reserved += quantity;
      break;
    case 'unreserve':
      this.stock.reserved = Math.max(0, this.stock.reserved - quantity);
      break;
    case 'adjustment':
      this.stock.onHand = quantity;
      break;
  }
  
  return this.save();
};

productSchema.methods.incrementViews = function() {
  this.statistics.views += 1;
  return this.save();
};

productSchema.methods.addSale = function(quantity, revenue) {
  this.statistics.sales += quantity;
  this.statistics.revenue += revenue;
  return this.save();
};

// Méthodes statiques
productSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true, isAvailable: true });
};

productSchema.statics.findLowStock = function() {
  return this.find({
    $expr: {
      $lte: [
        { $subtract: ['$stock.onHand', '$stock.reserved'] },
        '$stock.thresholdAlert'
      ]
    },
    isActive: true
  });
};

productSchema.statics.findExpiringSoon = function(days = 30) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  
  return this.find({
    expiryDate: {
      $gte: new Date(),
      $lte: expiryDate
    },
    isActive: true
  });
};

productSchema.statics.search = function(query, options = {}) {
  const {
    category,
    subCategory,
    minPrice,
    maxPrice,
    inStock,
    prescriptionRequired,
    sortBy = 'name',
    sortOrder = 'asc',
    page = 1,
    limit = 20
  } = options;
  
  let filter = { isActive: true, isAvailable: true };
  
  // Recherche textuelle
  if (query) {
    filter.$text = { $search: query };
  }
  
  // Filtres
  if (category) filter.category = category;
  if (subCategory) filter.subCategory = subCategory;
  if (minPrice !== undefined) filter.priceTTC = { $gte: minPrice };
  if (maxPrice !== undefined) {
    filter.priceTTC = filter.priceTTC || {};
    filter.priceTTC.$lte = maxPrice;
  }
  if (inStock) {
    filter.$expr = {
      $gt: [
        { $subtract: ['$stock.onHand', '$stock.reserved'] },
        0
      ]
    };
  }
  if (prescriptionRequired !== undefined) {
    filter.isPrescriptionRequired = prescriptionRequired;
  }
  
  // Tri
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  
  // Pagination
  const skip = (page - 1) * limit;
  
  return this.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('supplierId', 'name email telephone');
};

const Product = mongoose.model('Product', productSchema);

export default Product;
