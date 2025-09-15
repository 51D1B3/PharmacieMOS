import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  priceTTC: {
    type: Number,
    required: true
  },
  priceHT: {
    type: Number,
    required: true
  },
  stock: {
    onHand: {
      type: Number,
      default: 0
    },
    thresholdAlert: {
      type: Number,
      default: 10
    }
  },
  image: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Product', productSchema);