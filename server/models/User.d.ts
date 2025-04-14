// models/User.d.ts
import { Document } from 'mongoose';

export interface User extends Document {
  _id: string; // MongoDB ObjectId thường được chuyển thành string trong TypeScript
  name: string;
  email: string;
  password: string;
  role: string; // Giá trị mặc định là 'user'
  isVerified: boolean; // Giá trị mặc định là false
  isLocked: boolean; // Giá trị mặc định là false
  resetPasswordToken?: string; // Có thể null/undefined
  resetPasswordExpire?: Date; // Có thể null/undefined
  createdAt: Date; // Từ timestamps
  updatedAt: Date; // Từ timestamps
}