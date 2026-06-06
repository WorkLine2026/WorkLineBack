// src/models/JobRequest.js
const mongoose = require('mongoose');

const jobRequestSchema = new mongoose.Schema({
  companyName:  { type: String, required: true, trim: true },
  sector:       { type: String, required: true, trim: true },
  companySize:  { type: String, default: null },
  contactName:  { type: String, required: true, trim: true },
  contactRole:  { type: String, default: null },
  phone:        { type: String, required: true, trim: true },
  email:        { type: String, required: true, lowercase: true, trim: true },
  taxId:        { type: String, default: null },

  positions:    { type: [String], required: true },
  headcount:    { type: Number, required: true },
  expRequired:  { type: String, default: null },
  langs:        { type: [String], default: ['ქართული'] },
  certsRequired:{ type: [String], default: [] },
  requirements: { type: String, default: null },

  duration:     { type: String, required: true },
  schedule:     { type: [String], default: [] },
  salaryFrom:   { type: Number, default: null },
  salaryTo:     { type: Number, default: null },
  payType:      { type: String, default: null },
  benefits:     { type: [String], default: [] },

  city:         { type: String, required: true },
  district:     { type: String, default: null },
  address:      { type: String, default: null },
  workEnv:      { type: String, default: null },

  startDate:    { type: String, required: true },
  specificDate: { type: Date, default: null },

  notes:        { type: String, default: null },
  agreed:       { type: Boolean, required: true },

  // Admin fields
  // ✅ განახლებული: დამატებული 'archived' status
  status:       { 
    type: String, 
    enum: ['pending', 'processing', 'contacted', 'archived'], 
    default: 'pending' 
  },
  notes_admin:  { type: String, default: null },
  isViewed:     { type: Boolean, default: false },
  viewedAt:     { type: Date, default: null },

  ipAddress:    { type: String, default: null },
  submittedAt:  { type: Date, default: Date.now },
});

module.exports = mongoose.model('JobRequest', jobRequestSchema);