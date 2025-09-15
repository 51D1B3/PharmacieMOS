import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
    enum: ['pending', 'validated', 'rejected'],
    default: 'pending'
  },
  description: String,
  validatedAt: Date,
  validatedBy: String,
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Prescription', prescriptionSchema);