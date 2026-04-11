import mongoose, { Schema, Document } from 'mongoose';

const ApplicationSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Applied', 'Phone Screen', 'Interview', 'Offer', 'Rejected'], 
    default: 'Applied' 
  },
  location: { type: String },
  requiredSkills: { type: [String], default: [] },
  dateApplied: { type: Date, default: Date.now },
  resumeSuggestions: { type: [String], default: [] }
}, { timestamps: true });

export default mongoose.model('Application', ApplicationSchema);