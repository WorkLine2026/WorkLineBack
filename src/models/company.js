const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const companySchema = new mongoose.Schema(
  {
    // ── კომპანიის ინფო ─────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'კომპანიის სახელი სავალდებულოა'],
      trim: true,
    },
    identificationCode: {
      type: String,
      required: [true, 'საიდენტიფიკაციო კოდი სავალდებულოა'],
      unique: true,
      match: [/^\d{9}$/, 'საიდენტიფიკაციო კოდი უნდა შეიცავდეს ზუსტად 9 ციფრს'],
      trim: true,
    },
    sector: {
      type: String,
      required: [true, 'სფერო სავალდებულოა'],
      enum: [
        'სუპერმარკეტი',
        'რესტორანი / კაფე',
        'სასტუმრო',
        'საწყობი',
        'აფთიაქი',
        'სავაჭრო ცენტრი',
        'ქოლ-ცენტრი',
        'სხვა',
      ],
    },
    city: {
      type: String,
      required: [true, 'ქალაქი სავალდებულოა'],
      enum: ['თბილისი', 'ბათუმი', 'ქუთაისი', 'რუსთავი', 'გორი', 'ზუგდიდი', 'სხვა'],
    },

    // ── საკონტაქტო ─────────────────────────────────────────────────────────────
    phone: {
      type: String,
      required: [true, 'ტელეფონი სავალდებულოა'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'ელ-ფოსტა სავალდებულოა'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'სწორი ელ-ფოსტის მისამართი'],
    },
    password: {
      type: String,
      required: [true, 'პაროლი სავალდებულოა'],
      minlength: 8,
      select: false, // არ ჩაირთვება query-ში ავტომატურად
    },

    // ── ვერიფიკაცია ────────────────────────────────────────────────────────────
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      select: false,
    },
    verificationCodeExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt ავტომატურად
  }
);

// ── პაროლის ჰეშირება save-მდე ─────────────────────────────────────────────────
companySchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── პაროლის შემოწმება ─────────────────────────────────────────────────────────
companySchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Company', companySchema);