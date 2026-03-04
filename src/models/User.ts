import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'cdc', 'principal'], default: 'student' },
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);
