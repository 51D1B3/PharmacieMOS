import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  clientName: String,
  clientEmail: String,
  imageUrl: {
    type: String,
    required: true
  },
  fileName: String,
  status: {
    type: String,
    enum: ['pending', 'validated', 'prepared', 'delivered', 'rejected'],
    default: 'pending'
  },
  medications: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    quantity: Number,
    price: Number,
    available: { type: Boolean, default: true }
  }],
  totalAmount: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'orange_money', 'mtn_money']
  },
  description: String,
  validatedAt: Date,
  validatedBy: String,
  pharmacistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Prescription', prescriptionSchema);