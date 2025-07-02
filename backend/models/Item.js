// 1. Update models/Item.js to better handle resource types
import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['asset', 'venue', 'consumable'],
      required: true
    },
    description: String,
    location: String,
    quantity: { type: Number, default: 1 },
    availability: { type: Boolean, default: true },
    
    // Venue-specific fields
    capacity: { type: Number }, // for venues
    timeSlots: [{
      start: String, // e.g., "09:00"
      end: String,   // e.g., "17:00"
      days: [String] // ["monday", "tuesday", etc.]
    }],
    
    // Asset-specific fields
    serialNumber: String,
    condition: { 
      type: String, 
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good'
    },
    
    // Consumable-specific fields
    stockLevel: { type: Number, default: 0 },
    minStockLevel: { type: Number, default: 10 },
    unit: String // e.g., "pieces", "boxes", "liters"
  },
  { timestamps: true }
);

export default mongoose.model('Item', itemSchema);