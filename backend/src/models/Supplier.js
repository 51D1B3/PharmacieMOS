import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du fournisseur est requis'],
    trim: true,
    unique: true,
    maxlength: [150, 'Le nom du fournisseur ne peut pas dépasser 150 caractères']
  },
  contactPerson: {
    type: String,
    trim: true,
    maxlength: [100, 'Le nom du contact ne peut pas dépasser 100 caractères']
  },
  email: {
    type: String,
    required: [true, 'L\'email du fournisseur est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Le numéro de téléphone ne peut pas dépasser 20 caractères']
  },
  address: {
    street: String,
    city: String,
    zipCode: String,
    country: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    maxlength: [1000, 'Les notes ne peuvent pas dépasser 1000 caractères']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

supplierSchema.index({ name: 'text' });

export default mongoose.model('Supplier', supplierSchema);
