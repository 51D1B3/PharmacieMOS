import mongoose from 'mongoose';
import slugify from 'slugify';

const categorySchema = new mongoose.Schema({
    // Informations de base
    name: {
        type: String,
        required: [true, 'Le nom de la catégorie est requis'],
        trim: true,
        maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
    },
    
    // Hiérarchie
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    level: {
        type: Number,
        default: 0,
        min: [0, 'Le niveau ne peut pas être négatif']
    },
    path: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    
    // Image et icône
    image: {
        url: String,
        alt: String
    },
    icon: {
        type: String,
        trim: true
    },
    
    // SEO
    metaTitle: {
        type: String,
        trim: true,
        maxlength: [60, 'Le titre meta ne peut pas dépasser 60 caractères']
    },
    metaDescription: {
        type: String,
        trim: true,
        maxlength: [160, 'La description meta ne peut pas dépasser 160 caractères']
    },
    keywords: [{
        type: String,
        trim: true
    }],
    
    // Configuration
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    
    // Restrictions
    requiresPrescription: {
        type: Boolean,
        default: false
    },
    ageRestriction: {
        type: String,
        enum: ['none', 'child', 'adult', 'senior'],
        default: 'none'
    },
    
    // Statistiques
    stats: {
        productCount: {
            type: Number,
            default: 0
        },
        totalSales: {
            type: Number,
            default: 0
        },
        averageRating: {
            type: Number,
            default: 0,
            min: [0, 'La note moyenne ne peut pas être négative'],
            max: [5, 'La note moyenne ne peut pas dépasser 5']
        },
        viewCount: {
            type: Number,
            default: 0
        }
    },
    
    // Paramètres de stock
    stockSettings: {
        lowStockThreshold: {
            type: Number,
            default: 10,
            min: [0, 'Le seuil de stock bas ne peut pas être négatif']
        },
        reorderPoint: {
            type: Number,
            default: 5,
            min: [0, 'Le point de réapprovisionnement ne peut pas être négatif']
        },
        autoReorder: {
            type: Boolean,
            default: false
        }
    },
    
    // Métadonnées
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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

// Index

categorySchema.index({ parentId: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ isFeatured: 1 });
categorySchema.index({ sortOrder: 1 });
categorySchema.index({ name: 'text', description: 'text' });
categorySchema.index({ 'stats.productCount': -1 });
categorySchema.index({ 'stats.totalSales': -1 });

// Virtuals
categorySchema.virtual('children', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parentId'
});

categorySchema.virtual('parent', {
    ref: 'Category',
    localField: 'parentId',
    foreignField: '_id',
    justOne: true
});

categorySchema.virtual('ancestors', {
    ref: 'Category',
    localField: 'path',
    foreignField: '_id'
});

categorySchema.virtual('fullPath').get(function() {
    return this.path.map(id => id.toString()).join(' > ');
});

categorySchema.virtual('hasChildren').get(function() {
    return this.children && this.children.length > 0;
});

categorySchema.virtual('isLeaf').get(function() {
    return !this.hasChildren;
});

// Middleware pre-save
categorySchema.pre('validate', async function(next) {
    // Générer le slug à partir du nom si la catégorie est nouvelle ou si le nom a été modifié
    if ((this.isNew || this.isModified('name')) && this.name) {
        this.slug = slugify(this.name, { lower: true, strict: true, locale: 'fr' });
    }
    // Mettre à jour le niveau et le chemin
    if (this.parentId) {
        const parent = await this.constructor.findById(this.parentId);
        if (parent) {
            this.level = parent.level + 1;
            this.path = [...parent.path, parent._id];
        }
    } else {
        this.level = 0;
        this.path = [];
    }
    
    // Générer les meta tags s'ils n'existent pas
    if (!this.metaTitle) {
        this.metaTitle = this.name;
    }
    if (!this.metaDescription) {
        this.metaDescription = this.description || `Découvrez notre sélection de ${this.name}`;
    }
    
    next();
});

// Méthodes statiques
categorySchema.statics.getTree = function() {
    return this.find({ isActive: true })
        .populate('children')
        .sort({ sortOrder: 1, name: 1 });
};

categorySchema.statics.getRootCategories = function() {
    return this.find({ 
        parentId: null,
        isActive: true 
    })
    .populate('children')
    .sort({ sortOrder: 1, name: 1 });
};

categorySchema.statics.getFeatured = function() {
    return this.find({ 
        isFeatured: true,
        isActive: true 
    })
    .sort({ sortOrder: 1, name: 1 });
};

categorySchema.statics.getBySlug = function(slug) {
    return this.findOne({ 
        slug: slug,
        isActive: true 
    })
    .populate('parent')
    .populate('children');
};

categorySchema.statics.getPath = function(categoryId) {
    return this.findById(categoryId)
        .populate('path')
        .then(category => category ? category.path : []);
};

// Méthodes d'instance
categorySchema.methods.getChildren = function() {
    return this.constructor.find({ 
        parentId: this._id,
        isActive: true 
    })
    .sort({ sortOrder: 1, name: 1 });
};

categorySchema.methods.getDescendants = function() {
    return this.constructor.find({ 
        path: this._id,
        isActive: true 
    })
    .sort({ level: 1, sortOrder: 1, name: 1 });
};

categorySchema.methods.getAncestors = function() {
    return this.constructor.find({ 
        _id: { $in: this.path },
        isActive: true 
    })
    .sort({ level: 1 });
};

categorySchema.methods.updateProductCount = function() {
    const Product = mongoose.model('Product');
    return Product.countDocuments({ category: this._id })
        .then(count => {
            this.stats.productCount = count;
            return this.save();
        });
};

categorySchema.methods.updateStats = function() {
    const Product = mongoose.model('Product');
    return Product.aggregate([
        { $match: { category: this._id, isActive: true } },
        {
            $group: {
                _id: null,
                totalSales: { $sum: '$stats.totalSales' },
                averageRating: { $avg: '$stats.averageRating' },
                totalViews: { $sum: '$stats.viewCount' }
            }
        }
    ]).then(results => {
        if (results.length > 0) {
            this.stats.totalSales = results[0].totalSales || 0;
            this.stats.averageRating = results[0].averageRating || 0;
            this.stats.viewCount = results[0].totalViews || 0;
        }
        return this.save();
    });
};

export default mongoose.model('Category', categorySchema);