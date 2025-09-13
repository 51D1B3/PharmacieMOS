import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  // Informations du client
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clientName: {
    type: String,
    required: true
  },
  clientEmail: {
    type: String,
    required: true
  },
  
  // Informations de l'ordonnance
  imageUrl: {
    type: String,
    required: true
  },
  cloudinaryPublicId: {
    type: String,
    required: true
  },
  
  // Statut de traitement
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'rejected'],
    default: 'pending'
  },
  
  // Notes du pharmacien
  pharmacistNotes: {
    type: String,
    default: ''
  },
  
  // Médicaments identifiés
  medications: [{
    name: String,
    dosage: String,
    quantity: Number,
    instructions: String,
    price: Number
  }],
  
  // Total estimé
  estimatedTotal: {
    type: Number,
    default: 0
  },
  
  // Dates
  submittedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index pour les performances
prescriptionSchema.index({ clientId: 1 });
prescriptionSchema.index({ status: 1 });
prescriptionSchema.index({ submittedAt: -1 });

export default mongoose.model('Prescription', prescriptionSchema);