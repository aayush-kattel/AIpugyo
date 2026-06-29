import mongoose from 'mongoose';

const placeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  district: { type: String },
  region: { type: String },
  lat: { type: Number },
  lng: { type: Number },
  category: { type: String, enum: ['tourist', 'heritage', 'trail'] },
  significance: { type: String },
  bestTime: { type: String },
}, { timestamps: true });

export default mongoose.model('Place', placeSchema);