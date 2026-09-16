const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Full name is required'], trim: true, maxlength: 100 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}$/, 'Please provide a valid email'],
    },
    password: { type: String, required: [true, 'Password is required'], minlength: 8, select: false },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    address: {
      line1: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    phone: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare passwords
userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Never leak password hash in JSON responses
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
