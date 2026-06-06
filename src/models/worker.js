const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
  // Personal & Contact
  fname: {
    type: String,
    required: [true, 'სახელი აუცილებელია'],
    trim: true
  },
  lname: {
    type: String,
    required: [true, 'გვარი აუცილებელია'],
    trim: true
  },
  dob: {
    type: String,
    default: ''
  },
  gender: {
    type: String,
    default: ''
  },
  pid: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    required: [true, 'ქალაქი აუცილებელია']
  },
  phone: {
    type: String,
    required: [true, 'ტელეფონი აუცილებელია'],
    unique: true, // <- ეს უკვე ქმნის ინდექსს, ამიტომ ქვემოთ აღარ გვჭირდება
    sparse: true
  },
  email: {
    type: String,
    sparse: true,
    trim: true,
    lowercase: true,
    default: ''
  },
  wa: {
    type: String,
    default: ''
  },
  fb: {
    type: String,
    default: ''
  },

  // Experience & Education
  sectors: {
    type: [String],
    required: [true, 'მინიმუმ ერთი სფერო აუცილებელია']
  },
  exp: {
    type: String,
    required: [true, 'გამოცდილება აუცილებელია']
  },
  edu: {
    type: String,
    default: ''
  },
  langs: {
    type: [String],
    default: ['ქართული']
  },
  computer: {
    type: [String],
    default: []
  },
  bio: {
    type: String,
    default: ''
  },

  // Certificates
  certs: {
    type: [String],
    default: []
  },
  customCerts: {
    type: [String],
    default: []
  },
  certFiles: {
    type: [String],
    default: []
  },

  // Health
  restrictions: {
    type: [String],
    default: []
  },
  medbook: {
    type: String,
    default: ''
  },
  healthNote: {
    type: String,
    default: ''
  },

  // Availability
  avail: {
    type: String,
    required: [true, 'ხელმისაწვდომობა აუცილებელია']
  },
  schedule: {
    type: [String],
    default: []
  },
  salary: {
    type: Number,
    default: null
  },
  cvFiles: {
    type: [String],
    default: []
  },

  // System fields
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'inactive'],
    default: 'active'
  }
});

// Indexes (phone წავშალეთ აქედან დუბლირების გამო)
WorkerSchema.index({ city: 1 });
WorkerSchema.index({ sectors: 1 });
WorkerSchema.index({ createdAt: -1 });

// Update timestamp before save
WorkerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Worker', WorkerSchema);