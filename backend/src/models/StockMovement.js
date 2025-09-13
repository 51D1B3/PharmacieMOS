import mongoose from 'mongoose';

const stockMovementSchema = new mongoose.Schema({
    // Informations de base
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Le produit est requis']
    },
    type: {
        type: String,
        enum: ['in', 'out', 'adjustment', 'transfer', 'return', 'damage', 'expiry'],
        required: [ false, 'Le type de mouvement est requis']
    },
    quantity: {
        type: Number,
        required: [true, 'La quantité est requise'],
        min: [0, 'La quantité ne peut pas être négative']
    },
    
    // Informations détaillées
    reference: {
        type: String,
        required: [true, 'La référence est requise'],
        trim: true
    },
    referenceType: {
        type: String,
        enum: ['purchase_order', 'sales_order', 'manual', 'inventory', 'transfer', 'return', 'damage', 'expiry'],
        required: function() {
            return ['purchase_order', 'sales_order', 'transfer', 'return'].includes(this.referenceType);
        }
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'referenceModel'
    },
    referenceModel: {
        type: String,
        enum: ['Order', 'PurchaseOrder', 'Transfer', 'Return'],
        required: function() {
            return ['purchase_order', 'sales_order', 'transfer', 'return'].includes(this.referenceType);
        }
    },
    
    // Stock avant et après
    stockBefore: {
        type: Number,
        required: [true, 'Le stock avant est requis'],
        min: [0, 'Le stock avant ne peut pas être négatif']
    },
    stockAfter: {
        type: Number,
        required: [true, 'Le stock après est requis'],
        min: [0, 'Le stock après ne peut pas être négatif']
    },
    
    // Coûts
    unitCost: {
        type: Number,
        min: [0, 'Le coût unitaire ne peut pas être négatif']
    },
    totalCost: {
        type: Number,
        min: [0, 'Le coût total ne peut pas être négatif']
    },
    averageCost: {
        type: Number,
        min: [0, 'Le coût moyen ne peut pas être négatif']
    },
    
    // Localisation
    location: {
        warehouse: {
            type: String,
            default: 'main',
            trim: true
        },
        shelf: {
            type: String,
            trim: true
        },
        bin: {
            type: String,
            trim: true
        }
    },
    
    // Informations de lot
    batchNumber: {
        type: String,
        trim: true
    },
    expiryDate: {
        type: Date
    },
    manufacturingDate: {
        type: Date
    },
    
    // Raisons et notes
    reason: {
        type: String,
        enum: [
            'purchase', 'sale', 'return', 'damage', 'expiry', 'theft', 'adjustment',
            'transfer_in', 'transfer_out', 'inventory_correction', 'quality_control', 'initial_stock'
        ],
        required: [true, 'La raison est requise']
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Les notes ne peuvent pas dépasser 500 caractères']
    },
    
    // Informations de livraison (pour les entrées)
    delivery: {
        supplierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Supplier'
        },
        deliveryDate: Date,
        invoiceNumber: {
            type: String,
            trim: true
        },
        deliveryNote: {
            type: String,
            trim: true
        }
    },
    
    // Informations de qualité
    quality: {
        status: {
            type: String,
            enum: ['good', 'damaged', 'expired', 'quarantine'],
            default: 'good'
        },
        inspectionDate: Date,
        inspectorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        inspectionNotes: {
            type: String,
            trim: true
        }
    },
    
    // Métadonnées
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'L\'utilisateur créateur est requis']
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: Date,
    
    // Statut
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled'],
        default: 'approved'
    },
    
    // Audit
    auditTrail: [{
        action: {
            type: String,
            enum: ['created', 'updated', 'approved', 'rejected', 'cancelled'],
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        notes: String
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index
stockMovementSchema.index({ productId: 1, createdAt: -1 });
stockMovementSchema.index({ type: 1 });
stockMovementSchema.index({ referenceType: 1, referenceId: 1 });
stockMovementSchema.index({ 'location.warehouse': 1 });
stockMovementSchema.index({ batchNumber: 1 });
stockMovementSchema.index({ expiryDate: 1 });
stockMovementSchema.index({ status: 1 });
stockMovementSchema.index({ createdBy: 1 });
stockMovementSchema.index({ createdAt: -1 });
stockMovementSchema.index({ 'delivery.supplierId': 1 });

// Virtuals
stockMovementSchema.virtual('isInbound').get(function() {
    return ['in', 'return', 'transfer'].includes(this.type);
});

stockMovementSchema.virtual('isOutbound').get(function() {
    return ['out', 'damage', 'expiry'].includes(this.type);
});

stockMovementSchema.virtual('stockChange').get(function() {
    return this.stockAfter - this.stockBefore;
});

stockMovementSchema.virtual('isExpired').get(function() {
    if (!this.expiryDate) return false;
    return new Date() > this.expiryDate;
});

stockMovementSchema.virtual('daysUntilExpiry').get(function() {
    if (!this.expiryDate) return null;
    const now = new Date();
    const diffTime = this.expiryDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Middleware pre-save
stockMovementSchema.pre('save', function(next) {
    // Calculer le coût total si le coût unitaire est fourni
    if (this.unitCost && this.quantity) {
        this.totalCost = this.unitCost * this.quantity;
    }
    
    // Calculer le stock après si le stock avant est fourni
    if (this.stockBefore !== undefined && this.quantity !== undefined) {
        if (this.isInbound) {
            this.stockAfter = this.stockBefore + this.quantity;
        } else {
            this.stockAfter = this.stockBefore - this.quantity;
        }
    }
    
    // Ajouter à l'audit trail
    if (this.isNew) {
        this.auditTrail.push({
            action: 'created',
            userId: this.createdBy,
            notes: 'Mouvement de stock créé'
        });
    }
    
    next();
});

// Middleware post-save
stockMovementSchema.post('save', async function() {
    // Mettre à jour le stock du produit
    const Product = mongoose.model('Product');
    const product = await Product.findById(this.productId);
    if (product) {
        if (this.isInbound) {
            product.stock.onHand = (product.stock.onHand || 0) + this.quantity;
        } else if (this.isOutbound) {
            product.stock.onHand = Math.max(0, (product.stock.onHand || 0) - this.quantity);
        }
        await product.save();
    }
    
    // Intégration Socket.IO à déclencher côté application (pas ici pour éviter les dépendances circulaires)
});

// Méthodes statiques
stockMovementSchema.statics.getByProduct = function(productId, options = {}) {
    const query = { productId };
    
    if (options.type) query.type = options.type;
    if (options.dateFrom) query.createdAt = { $gte: new Date(options.dateFrom) };
    if (options.dateTo) query.createdAt = { ...query.createdAt, $lte: new Date(options.dateTo) };
    
    return this.find(query)
        .populate('productId', 'name sku')
        .populate('createdBy', 'firstName lastName')
        .populate('approvedBy', 'firstName lastName')
        .sort({ createdAt: -1 });
};

stockMovementSchema.statics.getByReference = function(referenceType, referenceId) {
    return this.find({ referenceType, referenceId })
        .populate('productId', 'name sku')
        .populate('createdBy', 'firstName lastName')
        .sort({ createdAt: -1 });
};

stockMovementSchema.statics.getInventoryValue = function(date = new Date()) {
    return this.aggregate([
        { $match: { createdAt: { $lte: date } } },
        {
            $group: {
                _id: '$productId',
                totalIn: {
                    $sum: {
                        $cond: [
                            { $in: ['$type', ['in', 'return']] },
                            '$quantity',
                            0
                        ]
                    }
                },
                totalOut: {
                    $sum: {
                        $cond: [
                            { $in: ['$type', ['out', 'damage', 'expiry']] },
                            '$quantity',
                            0
                        ]
                    }
                },
                totalCost: {
                    $sum: {
                        $cond: [
                            { $in: ['$type', ['in', 'return']] },
                            '$totalCost',
                            0
                        ]
                    }
                }
            }
        },
        {
            $project: {
                stockOnHand: { $subtract: ['$totalIn', '$totalOut'] },
                averageCost: {
                    $cond: [
                        { $gt: ['$totalIn', 0] },
                        { $divide: ['$totalCost', '$totalIn'] },
                        0
                    ]
                }
            }
        },
        {
            $match: { stockOnHand: { $gt: 0 } }
        }
    ]);
};

stockMovementSchema.statics.getLowStockAlerts = function() {
    const Product = mongoose.model('Product');
    return Product.find({
        'stock.onHand': { $lte: '$stock.threshold' },
        isActive: true
    }).then(products => {
        return products.map(product => ({
            productId: product._id,
            productName: product.name,
            currentStock: product.stock.onHand,
            threshold: product.stock.threshold,
            status: product.stock.onHand === 0 ? 'out_of_stock' : 'low_stock'
        }));
    });
};

// Méthodes d'instance
stockMovementSchema.methods.approve = function(userId, notes = '') {
    this.status = 'approved';
    this.approvedBy = userId;
    this.approvedAt = new Date();
    
    this.auditTrail.push({
        action: 'approved',
        userId: userId,
        notes: notes || 'Mouvement approuvé'
    });
    
    return this.save();
};

stockMovementSchema.methods.reject = function(userId, notes = '') {
    this.status = 'rejected';
    
    this.auditTrail.push({
        action: 'rejected',
        userId: userId,
        notes: notes || 'Mouvement rejeté'
    });
    
    return this.save();
};

stockMovementSchema.methods.cancel = function(userId, notes = '') {
    this.status = 'cancelled';
    
    this.auditTrail.push({
        action: 'cancelled',
        userId: userId,
        notes: notes || 'Mouvement annulé'
    });
    
    return this.save();
};

export default mongoose.model('StockMovement', stockMovementSchema);