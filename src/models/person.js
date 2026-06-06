const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const PersonSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  birthDate: { type: String, required: true },
  gender:    { type: String, required: true, enum: ['male', 'female', 'other'] },
  idNumber:  {
    type: String, required: true, unique: true,
    validate: { validator: v => /^\d{11}$/.test(v), message: 'პირადი ნომერი უნდა იყოს 11 ციფრი' },
  },
  city:         { type: String, required: true },
  sector:       { type: String, required: true },
  experience:   { type: String, required: true },
  availability: { type: String, required: true },
  schedules:    [{ type: String }],
  phone:        { type: String, required: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:     { type: String, required: true, minlength: 8 },

  isVerified:              { type: Boolean, default: false },
  verificationCode:        { type: String,  default: null, select: false },
  verificationCodeExpires: { type: Date,    default: null, select: false },
}, { timestamps: true });

PersonSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const bcrypt = require('bcryptjs');
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

PersonSchema.methods.comparePassword = function (candidate) {
  const bcrypt = require('bcryptjs');
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('Person', PersonSchema);