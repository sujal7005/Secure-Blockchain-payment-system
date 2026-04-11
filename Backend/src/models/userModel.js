// Backend/src/models/userModel.js (Async/Await version - NO next)
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  walletAddress: {
    type: String,
    unique: true,
    sparse: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  avatar: {
    type: String
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // 2FA Fields
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    select: false
  },
  backupCodes: [{
    code: String,
    used: { type: Boolean, default: false }
  }],
  securitySettings: {
    twoFactorAuth: {
      type: Boolean,
      default: false
    },
    transactionLimit: {
      type: Number,
      default: 10000
    },
    notificationEmail: {
      type: Boolean,
      default: true
    },
    notificationPush: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// FIXED: Hash password before saving - NO next parameter
userSchema.pre('save', async function() {
  const user = this;
  
  // Only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) {
    return;
  }
  
  // Generate salt and hash password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Find user by email with password
userSchema.statics.findByEmailWithPassword = async function(email) {
  try {
    return await this.findOne({ email }).select('+password');
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model('User', userSchema);
export default User;