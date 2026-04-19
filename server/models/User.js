const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['admin', 'faculty', 'student'], default: 'student' },
  profilePhoto: { type: String, default: '' },
  department: { type: String, default: '' },
  rollNo: { type: String, default: '' },
  phone: { type: String, default: '' },
  semester: { type: Number, default: 1 },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  gamification: {
    points: { type: Number, default: 0 },
    badges: [{ name: String, icon: String, earnedAt: Date }],
    streak: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now }
  },
  isActive: { type: Boolean, default: true },
  refreshToken: { type: String, default: '' }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
